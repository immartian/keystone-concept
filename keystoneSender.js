// Sender part of distribution scheme
// ---------------------------------
//** This is a quick and dirty attempt to show a scheme of files distribution for musicoin **

// initial modules are self explanatory
const express = require('express')
const fileUpload = require('express-fileupload')
const stream = require('stream')
const SizeChunker = require('chunking-streams')
  .SizeChunker
const fs = require('fs')
const crypto = require('crypto')
const crypto2 = require('crypto2')
const app = express()
const path = require('path')
  // Our main working namespace
const chnk = {
  // Load settings from settings module, `chnk.settings` serves later as a settings provider.
  //
  // **_settings.js_** file serves both input and output apps for convenience.
  settings: require('./settings.js'),
  // Output data is accumulated in `chnk.out` object throughout file processing and ultimately packed into result keystone file. Hashes array is initialized to assure it's existence.
  out: {
    hashes: []
  },
  tmp: {}
}

// For convenience using middleware provided by `express-fileupload`.
app.use(fileUpload())

// The interface is served from static files via `express`'s static middleware.
app.use(express.static(chnk.settings.staticFilesIn))

// Here is the core of actual processing. It files upon call of `/upload` from the interface.
app.post('/upload', function (req, res) {
    // Convenience local variables shortcuts
    let sett = chnk.settings,
      out = chnk.out,
      tmp = chnk.tmp
      // In case upload transports no files we just gracefully exit and inform the interface.
    if (!req.files) {
      res.send('No file received!')
      return
    }
    // If there is file attached we grab it. The interface sends it as `iFile`, so we grab the entry with this name.
    tmp.inputFile = req.files.iFile
      // Using function provided by `express-fileupload` (`mv`) we process the file
    tmp.inputFile.mv(sett.inputFilesDir + path.sep + tmp.inputFile.name, function (err) {
      if (err) {
        // Obviously we report errors to the interface
        res.status(500)
          .send(err)
      } else {
        // If there is no error we start by setting up our environment
        // We start by setting `out.chunkKey` - it's the key used later to initiate a symmetric encryption of chunks. Its lenght depends on used encryption algorithm.
        out.chunkKey = crypto.randomBytes(sett.chunkKeyLen)
          .toString('hex')
          // We store a file name of the input file to later export with the keystone file.
        out.origFileName = tmp.inputFile.name
          // As the file is already saved by the middleware we must read it at this point (_this could be done otherwise, but rewriting this middleware makes no sense for presentation purposes only_).
        tmp.inputFileStream = fs.createReadStream(sett.inputFilesDir + path.sep + tmp.inputFile.name)
          // We use also a convenience module to split the file into chunks (_again, it could be done otherwise, for instance by making own transform stream, but makes no sense in this case_).
        tmp.chunker = new SizeChunker({
            // The chunk size is set here to 4MB. For music and small media files it's good tradeoff between the storage size and transport speed.
            chunkSize: 4194304,
            flushTail: true
          })
          // We run the chunker by feeding it from `tmp.inputFileStream`
        tmp.inputFileStream.pipe(tmp.chunker)
          // The `SizeChunker` we use, provides standard stream events together with two custom ones. The first - `chunkStart` - is fired when a new (or first) chunk is being processed.
        tmp.chunker.on('chunkStart', function (id, done) {
          // First we set up some temporary tool vars
          // As every chunk is ultimately written in a file we create a writable stream `tmp.chunkOutput`
          tmp.chunkOutput = fs.createWriteStream(path.join(sett.chunksDir + path.sep + sett.chunksFilePrefx) + id)
            // We want to know hashes of each chunk to write them later into keystone file. We must setup a hash (`tmp.chunkHash`). Hash uses algorithm defined in settings file.
          tmp.chunkHash = crypto.createHash(sett.chunkHashAlg)
          tmp.chunkHash.setEncoding('hex')
            // We want every chunk to be encrypted, but using the same key in all cases. So we set up a cipher (`tmp.chunkCipher`) to be used in encryption of a chunk
          tmp.chunkCipher = crypto.createCipher(sett.chunkCipher, out.chunkKey)
            // We need a tool readable stream as chunker returns Buffer. So we set up a readable stream (`tmp.chunkStrRead`) and define its read function (it must be done this way, as well as pushing null at the end).
          tmp.chunkStrRead = new stream.Readable()
          tmp.chunkStrRead._read = function noop() {}
          done();
        });

        // The `data` event fires on each data processing in a stream. It returns a `chunk` object containing id and data members.
        tmp.chunker.on('data', function (chunk) {
          // Here we update the hash of a chunk.
          tmp.chunkHash.update(chunk.data)
            // And here we push data to the temporary readable stream.
          tmp.chunkStrRead.push(chunk.data)
        });

        // Another event provided by `SizeChunker` is `chunkEnd`. As the name implies it fires upon closing of a chunk.
        tmp.chunker.on('chunkEnd', function (id, done) {
          // Here we null-terminate data in temporary readable stream.
          tmp.chunkStrRead.push(null)
            // Now we pipe the above stream through encryption and save it to a file.
          tmp.chunkStrRead.pipe(tmp.chunkCipher)
            .pipe(tmp.chunkOutput)
          tmp.chunkOutput.end()
            // As by now the hash should be ready we transform it into hex to be human readable.
          let hashResult = tmp.chunkHash.digest()
            .toString('hex')
            // Here we rename output chunk's file to a name containing the hash.
          fs.rename(path.join(sett.chunksDir + path.sep + sett.chunksFilePrefx) + id, path.join(sett.chunksDir + path.sep + sett.chunksFilePrefx) + hashResult + sett.chunksExtension)
            // Lastly we store the hash in a container that will later be incorporated into the keystone file.
          out.hashes.push(hashResult)
          done()
        });

        // Last event - `end` - is fired after the `SizeChunker` finished its job. We do a lot here, as we must now get all the data together and push it into a resulting keystone file.
        tmp.chunker.on('end', function () {
          // We set up the key `tmp.envelopeKey` to a symmetric cipher that will be used to seal a package with data collected so far. We call it 'envelopeKey' just to intorduce some mess.
          tmp.envelopeKey = crypto.randomBytes(sett.keystoneKeyLen)
            // Then we set up a cipher itself
          tmp.keystoneEncryptor = crypto.createCipher(sett.keystoneCipher, tmp.envelopeKey)
            // Now we push our data store with hashes through `tmp.keystoneEncryptor` and then to Buffer `tmp.encBufData`.
          tmp.bufData = Buffer.from(JSON.stringify(chnk.out))
          tmp.encBufData = tmp.keystoneEncryptor.update(tmp.bufData, '', 'hex')
          tmp.encBufData += tmp.keystoneEncryptor.final('hex')
          tmp.encBufData = Buffer.from(tmp.encBufData, 'hex')
            // We set up `tmp.headerBuf` that will hold length of the data.
          tmp.headerBuf = Buffer.allocUnsafe(4)
            // Here we use a `crypto2` convenience module to encrypt the envelopeKey with publicKey.
          crypto2.encrypt.rsa(tmp.envelopeKey.toString('hex'), sett.publicKey, (err, encrypted) => {
            // We gracefully manage errors if any.
            if (err) {
              res.send('Error occured while encrypting the envelope.\n' + err)
              return
            }
            // If everything is OK, we measure and assign to buffer a length in bytes of the encrypted with symmetric cipher data.
            tmp.headerBuf.writeInt32LE(Buffer.byteLength(tmp.encBufData))
              // Then we glue all data together, starting from length buffer, then encrypted data and finally RSA encrypted key to the data.
            tmp.resultBuf = Buffer.concat([tmp.headerBuf, tmp.encBufData, new Buffer(encrypted, 'base64')])
              // We write resulting buffer to the keystone file.
            tmp.tmpOutStr = fs.createWriteStream(sett.keystonesDir + path.sep + sett.keystoneFname)
            tmp.tmpOutStr.write(tmp.resultBuf)
              // Finally we send response to the interface with hex encoded result buffer. Because why not. And we clean up few things.
            res.send(tmp.resultBuf.toString('hex'))
            tmp.tmpOutStr.end()
            fs.unlink(sett.inputFilesDir + path.sep + tmp.inputFile.name)
          })
        })
      }
    })
  })
  // We set here our app to listen on a port of our choice
app.listen(chnk.settings.outPortIn)

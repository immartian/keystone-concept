// Receiver part of distribution scheme
// ---------------------------------
//** This is a quick and dirty attempt to show a scheme of files distribution for musicoin **

// initial modules are self explanatory
const express = require('express')
var expressWs = require('express-ws');
const stream = require('stream')
const fs = require('fs')
const crypto = require('crypto')
const crypto2 = require('crypto2')
expressWs = expressWs(express());
var app = expressWs.app;
const path = require('path')
const chokidar = require('chokidar');

// Our main working namespace
const chnk = {
  // Load settings from settings module, `chnk.settings` serves later as a settings provider.
  //
  // **_settings.js_** file serves both input and output apps for convenience.
  settings: require('./settings.js'),
  out: {
  },
  tmp: {}
}
chnk.tmp.initWatcher = () => {
    chnk.tmp.watcher && chnk.tmp.watcher.close() && (chnk.tmp.watcher == null)
    chnk.tmp.watcher = chokidar.watch(chnk.settings.keystonesDir + path.sep + chnk.settings.keystoneFname, {
      persistent: true
    });
    chnk.tmp.watcher
      .on('change', () => chnk.tmp.dataWs != undefined && chnk.tmp.dataWs.send('keystone changed'))
      .on('add', () => chnk.tmp.dataWs != undefined && chnk.tmp.dataWs.send('keystone added'))
      .on('unlink', () => chnk.tmp.dataWs != undefined && chnk.tmp.dataWs.send('keystone removed'));
  }

// The interface is served from static files via `express`'s static middleware.
app.use(express.static(chnk.settings.staticFilesOut))

chnk.out.decode = () => {
  // Convenience local variables shortcuts
  let sett = chnk.settings,
    out = chnk.out,
    tmp = chnk.tmp
  tmp.chunkLen=undefined;
  tmp.inputFileStream = fs.createReadStream(sett.keystonesDir + path.sep + sett.keystoneFname)
  tmp.inputFileStream.on('readable', function () {
    if (tmp.chunkLen === undefined) {
      tmp.chunkLen = tmp.inputFileStream.read(4)
        .readInt32LE()
    } else {
      tmp.dataBlock = Buffer.from(tmp.inputFileStream.read(tmp.chunkLen),'hex')
      tmp.encryptedKey = Buffer(0);
      while (null !== (chunk = tmp.inputFileStream.read())) {
        tmp.encryptedKey = Buffer.concat([tmp.encryptedKey,chunk])
      }
    }
  });
  tmp.inputFileStream.on('end',function(){
    crypto2.decrypt.rsa(tmp.encryptedKey, sett.privateKey, (err, decrypted) => {
      if (err) {
        chnk.tmp.dataWs.send('Error occured while decrypting of the envelope.\n' + err)
        return
      }
      tmp.keystoneDecryptor = crypto.createDecipher(sett.keystoneCipher, Buffer.from(decrypted,'hex'))
      var decryptedData = tmp.keystoneDecryptor.update(tmp.dataBlock)
      decryptedData+=tmp.keystoneDecryptor.final()
      tmp.data = JSON.parse(decryptedData)
      tmp.dataWs.send(decryptedData)
    })
  })
}

app.ws('/data', function (ws, req) {
  ws.on('message', function (msg) {
    msg == 'Initialized' && (chnk.tmp.dataWs = expressWs.getWss('/data', chnk.tmp.initWatcher())
      .clients[0])
    msg == 'abort' && (chnk.tmp.globalFlag = 'abort')
    msg == 'decode' && (chnk.out.decode())
    console.log('Mess', msg, chnk.tmp.dataWs != undefined)
  });
});

// We set here our app to listen on a port of our choice
app.listen(chnk.settings.outPortOut)

#Keystone concept presentation
This little app is meant to present a concept for Musicoin's data distribution model. The model consists of **Sender** and **Receiver** sides.

**Sender** side (possibly contract or an app using contract's api) takes a media file and performs following operations:
1. splits the file into chunks;
2. calculates hashes of chunks (MD5, SHA, XX...);
3. symmetrically (AES for instance) encrypts chunks with the same, created ad hoc, encryption key (*keyA*);
4. pushes chunks into a storage media (IPFS, cloud of a kind) renaming them to include own hashes to ease search. If IPFS is used resource locators can be saved and stored to a temporary storage.
5. pushes the *keyA* and hashes (in order) into the temporary storage (and resource locators if present and needed. Also other data as original filename and alike can be stored);
6. encrypts symmetrically the storage with another key (*keyB*);
7. encrypts the *keyB* with public key of the receiver;
8. calculates the length of encrypted data;
9. merges calculated length (4 bytes), data block and the encrypted key;
10. writes merged data into a binary file;
11. sends this file to receiver.

**Receiver** side, upon receiving the keystone file, performs the following operations:
1. decodes the length of data block;
2. extracts data block and encrypted key according to length decoded;
3. decrypts the *keyB* with own private key;
4. decrypts data (hashes, *keyA*, resource locators and other stored data);
**Three below steps not yet working in presentation**
5. uses hashes (and resource locators if present) to locate and fetch chunks from the network;
6. upon downloading chunks and validating them with hash they can be decrypted using *keyA*;
7. chunks can be used separately (for straming for instance - there is no need to download a whole file if the receiver only wants to play a part of file) or can be downloaded all and glued together.

The above scheme satisfies several aims of Musicoin's model:
- the resulting keystone file is very small (depending on chunks size and additional data stored it can weight from several hundreds bytes to few kilobytes). Thus it can be cheaply stored by a contract in blockchain (while data storage in blockchain is expensive small data files can be relatively cheap). There is no need to store all keystone files that are sent to receivers (paying clients), only a 'master' copy should be stored, encrypted with contract's public key. The contract, upon execution can decrypt the file, encrypt with public key of receiver and send it inside a transaction;
- the keystone is supposed to be sent only to receivers executing the contract, thus enabling paid individual distribution. Enabling subscription can be possible by storing expiration date inside the data sent;
- chunks can be distributed over P2P media or any other as well. They can be identified by hash;
- chunks size can be optimized with network topology in mind to get the best availability without clogging users' network connections;
- the above is very important when streaming media is to be implemented in Musicoin. As a storage is meant to be distributed among users and users are unevenly distributed geographically and over the structural network topology, availability of chunks in many places of network would make straming (and download) far more efficient;
- encryption of chunks is included to eliminate bulk content piracy, not to stop it (because it's impossible, we aren't DRM morons). This way, to pirate the content one must first obtain at least one legal keystone;
- chunks can also be compressed. Due to entropy variations in media (music, video) it's often more viable to compress smaller chunks than the whole file. 7zip is able to achieve up to 20% in  such cases;
- with further development toward this scheme additional benefits can be achieved. IPFS in version adjusted for Musicoin can optimize storage and transport to fixed chunk size (if fixed size will be chosen). In database solutions fixed size containers can be lot faster than unknown size ones;

I suppose some other thoughts could be expressed here, but the above is enough at the moment.

###Try it

To see this scheme in action there are two small Nodejs apps in this repo. As usual, clone the repo first.

Then satisfy dependancies with npm: `npm install`

Then you can edit `settings.js` file to adjust settings (directories, ports, etc).

Then, by running `keystoneSender.js` and opening it's web interface (default: localhost:9999) you'll have an option to pick a file, chunk it and produce the keystone file. As there is no network storage attached in this presentation, files are stored into respective directories set up in settings (IPFS binding can be added in the future for further tests).

After having keystone and chunks head to `keystoneReceiver.js`, run it and open its interface (default: localhost:19999). It should detect presence of the keystone file created earlier and ask for action (decode). Upon decoding it shows contents of keystone file and asks for further action (fetching and verification of chunks). If chunks are fetched and verified, the last action is to reconstruct the original. After reconstruction the file can be downloaded (or found in respective folder).

The code is documented **not all yet** - docs can be found in `doc` folder in html form (docco).

Enjoy.

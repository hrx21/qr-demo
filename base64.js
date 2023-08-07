const AES = require('aes-js');
const base64 = require('base64-js');
const qrcode = require('qrcode-terminal');
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

function encryptWithPublicKey(data, publicKey) {
  const bufferData = Buffer.from(data);
  const encryptedBuffer = crypto.publicEncrypt(publicKey, bufferData);
  return base64.fromByteArray(encryptedBuffer);
}

function decryptWithPrivateKey(encryptedData, privateKey) {
  const encryptedBuffer = Buffer.from(base64.toByteArray(encryptedData));
  const decryptedBuffer = crypto.privateDecrypt(privateKey, encryptedBuffer);
  return decryptedBuffer.toString();
}

const originalData = "Hello, this is a secure QR code!";

const encryptedAndEncodedData = encryptWithPublicKey(originalData, publicKey);

qrcode.generate(encryptedAndEncodedData, { small: true });

const decryptedData = decryptWithPrivateKey(encryptedAndEncodedData, privateKey);
console.log('Decrypted Data:', decryptedData);


  

// const AES = require('aes-js');
// const base64 = require('base64-js');
// const qrcode = require('qrcode-terminal');

// const encryptionKey = Buffer.from('0123456789ABCDEF0123456789ABCDEF', 'hex');

// function encryptAndEncodeData(data) {
//   const textBytes = Buffer.from(data);
//   const aesCtr = new AES.ModeOfOperation.ctr(encryptionKey);
//   const encryptedBytes = aesCtr.encrypt(textBytes);
//   return Buffer.from(encryptedBytes).toString('hex');
// }

// const originalData = "Hello, this is a secure QR code!";

// const encryptedAndEncodedData = encryptAndEncodeData(originalData);

// qrcode.generate(encryptedAndEncodedData, { small: true });
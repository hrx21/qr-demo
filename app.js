const crypto = require('crypto');
const qrcode = require('qrcode');

function generateEncryptionKey() {
    return crypto.randomBytes(32)
}

function encryptData(data, key) {
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    let encryptedData = cipher.update(data, 'utf-8', 'hex')
    encryptedData += cipher.final('hex')

    const authTag = cipher.getAuthTag();
    return { encryptedData, iv, authTag };
}

const dataToEncrypt = 'password';

const encryptionKey = generateEncryptionKey();

const { encryptedData, iv, authTag } = encryptData(dataToEncrypt, encryptionKey);

const dataForQR = JSON.stringify({ iv: iv.toString('hex'), encryptedData, authTag: authTag.toString('hex') });

qrcode.toDataURL(dataForQR, (err, qrCodeData) => {
  if (err) {
    console.error('Error generating QR code:', err);
  } else {
    console.log('QR code generated successfully:');
    console.log(qrCodeData, "llllllllllll");
  }
});

// const QRCode = require("qrcode")

// let data = {
//     name:"shefali",
//     age:24,
//     city:"kalyan",
//     department:"Sky High",
//     id:"aisuoiqu3234738jdhf100223"
// }

// let stringData = JSON.stringify(data)

// QRCode.toString(stringData, {type:"terminal"},
// function(err, QRCode) {
//     if(err) return console.log("error occured please try again!")
//     console.log(QRCode,"qrcode")
// })

// QRCode.toDataURL(stringData, function(err, code){
//     if(err) return console.log("error occured please try again!")
//     console.log(code, "code")
// })
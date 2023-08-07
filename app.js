const { Client } = require('pg');

// Connection configuration
const dbConfig = {
  user: 'your_username',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432, // Default PostgreSQL port
};

// Create a new PostgreSQL client instance
const client = new Client(dbConfig);

// Connect to the database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    // Now you can perform queries and other operations here
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL:', err);
  });

// Don't forget to close the connection when done
// client.end();



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

const ivHex = iv.toString('hex');
const authTagHex = authTag.toString('hex');

const dataForQR = JSON.stringify({ iv: ivHex, encryptedData, authTag: authTagHex });

// const dataForQR = JSON.stringify({ iv: iv.toString('hex'), encryptedData, authTag: authTag.toString('hex') });

function decryptData(encryptedData, key, ivHex, authTagHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');

  return decryptedData;
}

qrcode.toDataURL(dataForQR, (err, qrCodeData) => {
  if (err) {
    console.error('Error generating QR code:', err);
  } else {
    console.log('Encrypted Data Successfully:');
    console.log(qrCodeData);
  }
});

// const decryptedData = decryptData(encryptedData, encryptionKey, ivHex, authTagHex);
// console.log('Decrypted data:', decryptedData);












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
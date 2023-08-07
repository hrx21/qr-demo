const pool = require('./db')
const crypto = require('crypto');
const qrcode = require('qrcode');
const express = require('express')
const AES = require('aes-js');
const base64 = require('base64-js');
const qrcodeTerminal = require('qrcode-terminal');
const { Pool } = require('pg');

const app = express();
const port = 3000; // Choose a suitable port number


app.get('/fetch-fare', async (req, res) => {
  try {
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
    
    // Generate QR code and send as a response
    // qrcodeTerminal.generate(encryptedAndEncodedData, { small: true });
    // res.send('QR Code generated and sent to the client.');

    const decryptedData = decryptWithPrivateKey(encryptedAndEncodedData, privateKey);
    console.log('Decrypted Data:', decryptedData);

    // Connect to the PostgreSQL database
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'dmrc_test',
      password: 'root',
      port: 5432, 
    });

    const result = await pool.query('SELECT * FROM fare WHERE station_id = 4');

    if (result.rows.length === 0) {
      console.log('No fare information found for the specified station');
      return;
    }

    const totalFare = result.rows.map((el) => el[2]).reduce((acc, fare) => acc + fare, 0);

    console.log('Total Fare:', totalFare);

    const sign = crypto.createSign('RSA-SHA256');
    sign.write(totalFare.toString());
    sign.end();
    const signature = sign.sign(privateKey, 'base64');

    const responseData = {
      decryptedData: decryptedData,
      totalFare: totalFare,
      digitalSignature: signature,
    };

    res.json(responseData);

    // const sign = crypto.createSign('RSA-SHA256');
    // sign.write(totalFare.toString());
    // sign.end();
    // const signature = sign.sign(privateKey, 'base64');

    // console.log('Digital Signature:', signature);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// async function fetchData() {
//   try {
//     const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//       modulusLength: 2048,
//       publicKeyEncoding: {
//         type: 'spki',
//         format: 'pem',
//       },
//       privateKeyEncoding: {
//         type: 'pkcs8',
//         format: 'pem',
//       },
//     });
    
//     function encryptWithPublicKey(data, publicKey) {
//       const bufferData = Buffer.from(data);
//       const encryptedBuffer = crypto.publicEncrypt(publicKey, bufferData);
//       return base64.fromByteArray(encryptedBuffer);
//     }
    
//     function decryptWithPrivateKey(encryptedData, privateKey) {
//       const encryptedBuffer = Buffer.from(base64.toByteArray(encryptedData));
//       const decryptedBuffer = crypto.privateDecrypt(privateKey, encryptedBuffer);
//       return decryptedBuffer.toString();
//     }
    
//     const originalData = "Hello, this is a secure QR code!";
    
//     const encryptedAndEncodedData = encryptWithPublicKey(originalData, publicKey);
    
//     qrcodeTerminal.generate(encryptedAndEncodedData, { small: true });
    
//     const decryptedData = decryptWithPrivateKey(encryptedAndEncodedData, privateKey);
//     console.log('Decrypted Data:', decryptedData);
    
//     // const result = await pool.query('SELECT * FROM fare WHERE station_id = 4 ');
//     // console.log('Total Fare:', result.rows.map((el) => {return el[2]}));

//     const result = await pool.query('SELECT * FROM fare WHERE station_id = 4');

//     if (result.rows.length === 0) {
//       console.log('No fare information found for the specified station');
//       return; 
//     }

//     const totalFare = result.rows.map((el) => el[2]).reduce((acc, fare) => acc + fare, 0);

//     console.log('Total Fare:', totalFare);

//     const sign = crypto.createSign('RSA-SHA256');
//     sign.write(totalFare.toString());
//     sign.end();
//     const signature = sign.sign(privateKey, 'base64');

//     console.log('Digital Signature:', signature);

//   } catch (error) {
//     console.error('Error fetching data:', error);
//   } finally {
//     pool.end();
//   }
// }

// fetchData();




// function generateEncryptionKey() {
//     return crypto.randomBytes(32)
// }

// function encryptData(data, key) {
//     const iv = crypto.randomBytes(16)
    
//     const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

//     let encryptedData = cipher.update(data, 'utf-8', 'hex')
//     encryptedData += cipher.final('hex')

//     const authTag = cipher.getAuthTag();
//     return { encryptedData, iv, authTag };
// }

// const dataToEncrypt = 'password';

// const encryptionKey = generateEncryptionKey();

// const { encryptedData, iv, authTag } = encryptData(dataToEncrypt, encryptionKey);

// const ivHex = iv.toString('hex');
// const authTagHex = authTag.toString('hex');

// const dataForQR = JSON.stringify({ iv: ivHex, encryptedData, authTag: authTagHex });

// // const dataForQR = JSON.stringify({ iv: iv.toString('hex'), encryptedData, authTag: authTag.toString('hex') });

// function decryptData(encryptedData, key, ivHex, authTagHex) {
//   const iv = Buffer.from(ivHex, 'hex');
//   const authTag = Buffer.from(authTagHex, 'hex');

//   const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
//   decipher.setAuthTag(authTag);

//   let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
//   decryptedData += decipher.final('utf-8');

//   return decryptedData;
// }

// qrcode.toDataURL(dataForQR, (err, qrCodeData) => {
//   if (err) {
//     console.error('Error generating QR code:', err);
//   } else {
//     console.log('Encrypted Data Successfully:');
//     console.log(qrCodeData);
//   }
// });

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
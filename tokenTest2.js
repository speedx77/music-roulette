import axios from "axios"
import crypto from 'crypto';
import base32 from 'hi-base32'; // npm install hi-base32

function generateTotpManual(base32Secret, timestamp, {
  step = 30,
  digits = 6,
  algorithm = 'sha1'
} = {}) {
  const counter = Math.floor(timestamp / 1000 / step); // seconds -> time step

  const key = Buffer.from(base32.decode.asBytes(base32Secret)); // decode base32 to bytes
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(0, 0); // high 4 bytes (big-endian)
  counterBuffer.writeUInt32BE(counter, 4); // low 4 bytes

  const hmac = crypto.createHmac(algorithm, key).update(counterBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);

  const otp = binary % 10 ** digits;
  return otp.toString().padStart(digits, '0');
}

function cleanHex(hexStr) {
    const validHex = hexStr.replace(/[^a-fA-F0-9]/g, '');
    return validHex.length % 2 === 0 ? validHex : validHex.slice(0, -1);
}

// Generate TOTP based on custom logic
function generateTotp(serverTimeSeconds) {
    const secretCipher = [12, 56, 76, 33, 88, 44, 88, 33, 78, 78, 11, 66, 22, 22, 55, 69, 54];
    const processed = secretCipher.map((byte, i) => byte ^ ((i % 33) + 9));
    const processedStr = processed.join('');
    const utf8Bytes = Buffer.from(processedStr, 'utf8');
    const hexStr = utf8Bytes.toString('hex');
    const cleanedHex = cleanHex(hexStr);
    const secretBytes = Buffer.from(cleanedHex, 'hex');
    const base32Secret = base32.encode(secretBytes).replace(/=/g, '');

    return generateTotpManual(base32Secret, serverTimeSeconds * 1000)

    //totp.options = { digits: 6, step: 30, algorithm: 'sha1' };
    //return totp.generate(base32Secret, { timestamp: parseInt(serverTimeSeconds) * 1000 });
}


// Fetch helper
async function fetchJson(url, options = {}) {
    const response = await axios({ url, method: 'GET', ...options });
    return response.data;
}

// Main
async function refreshToken() {
    try{
        var sTime;
        var cTime;
        var totp;
        /*
        const timeResponse = await fetch("https://open.spotify.com/server-time").then(timeResponse => timeResponse.json()).then(data => {
            sTime = data.serverTime
            cTime = Math.floor(Date.now())
            totp =  generateTotp(sTime)
        });
        */
        sTime = Math.floor(Date.now() / 1000)
        cTime = Math.floor(Date.now())
        totp =  generateTotp(sTime)
        const params = new URLSearchParams({
            reason: 'init',
            productType: 'web-player',
            totp: totp,
            totpServer: totp,
            totpVer: 5,
            sTime: sTime,
            cTime: cTime,
            buildVer: 'web-player_2025-06-09_1749459253008_868bad8',
            buildDate: '2025-06-09'
        });
        console.log(params)
        console.log(`https://open.spotify.com/api/token?${params}`)
        const tokenResp = await fetch(`https://open.spotify.com/api/token?${params}`).then(tokenResp => tokenResp.json());
        console.log(tokenResp)

    } catch(error){
        console.log(error)
    }
}

refreshToken();
import axios from "axios"
import { totp } from "otplib"
import crypto from "crypto"


// Clean hexadecimal string
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
    const base32Secret = secretBytes.toString('base64').replace(/=/g, '');

    totp.options = { digits: 6, step: 30, algorithm: 'sha1' };
    return totp.generate(base32Secret, { timestamp: parseInt(serverTimeSeconds) * 1000 });
}

// Fetch helper
async function fetchJson(url, options = {}) {
    const response = await axios({ url, method: 'GET', ...options });
    return response.data;
}

// Main refresh token logic
async function refreshToken() {
     try {
        const testUrl="https://open.spotify.com/get_access_token?reason=init&productType=web-player&totp=694645&totpServer=694645&totpVer=5&sTime=1746038522&cTime=1746038525361&buildVer=web-player_2025-04-30_1746032747735_dcf0a19&buildDate=2025-04-30"
        const testResponse = await fetch(testUrl)
        .then(testResponse => testResponse.json())
        console.log(testResponse)
        const timeResponse = await fetch('https://open.spotify.com/server-time').then(timeResponse => timeResponse.json());
        console.log(timeResponse)
        const serverTimeSeconds = timeResponse.serverTime;
        //console.log('Server Time:', serverTimeSeconds);

        const totpCode = generateTotp(serverTimeSeconds);
        console.log('TOTP:', totpCode);

        const sTimestamp = Math.floor(Date.now() / 1000);
        console.log(sTimestamp)
        const cTimestamp = Math.floor(Date.now())
        console.log(cTimestamp)
        const params = {
            reason: 'init',
            productType: 'web-player',
            totp: '574132',
            totpServer: '574132',
            totpVer: '5',
            sTime: '1746038361',
            cTime: '1746038364687',
            buildVer: 'web-player_2025-04-30_1746032747735_dcf0a19',
            buildDate: '2025-04-30',
        };
        const testParams = new URLSearchParams({
            reason: 'init',
            productType: 'web-player',
            totp: '456491',
            totpServer: '456491',
            totpVer: '5',
            sTime: sTimestamp,
            cTime: cTimestamp,
            buildVer: 'web-player_2025-04-30_1746032747735_dcf0a19',
            buildDate: '2025-04-30',
        })
        const sp_dc = "BQDqE6GVNhLw6DvJMXFpl-_O_9qWg86fJJvhImDmjyaVxblGZruzINjuJcIISb9JgEX2okH8TcAdRkaT7A0bs09XOX25Db7Oi8bcwo9uT_Am1Jof-bX_Ql7EUEx6iJwEqSpK2fbNg5TrNGIrTuGjjCF6PfEFGtR6wqdNlZ_swDMPXjxkfUnZ-zLv5PnnRwbzcOKzAkFe-ZCsgbyD5GYxBHIBud3HttA76OroNkRJYVSLkc9d6HLbwdAyep6tcpmClTe7umgffgCBZw";
        const cookieHeader = `sp_dc=${sp_dc}`;

        const tokenResp = await fetch(`https://open.spotify.com/get_access_token?${testParams}`).then(tokenResp => tokenResp.json());

        const accessToken = tokenResp.accessToken;
        console.log(tokenResp)
        console.log('Access Token:', accessToken);

        const userSearched = 'jean';
        const searchURL = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=findUsers&variables=${encodeURIComponent(JSON.stringify({
            query: userSearched,
            limit: 30
        }))}&extensions=${encodeURIComponent(JSON.stringify({
            persistedQuery: {
                version: 1,
                sha256Hash: "6a25a3e3b8f1d43ef9fa4d4cd94599e14a7636c10d4dfb1dd3488e4ffeae3e9b"
            }
        }))}`;

        const searchResult = await fetch(searchURL, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(searchResult => searchResult.json());

        console.log('Search Result:', searchResult);
    } catch (err) {
        console.error('Error while refreshing token:', err);
    }
}

refreshToken();
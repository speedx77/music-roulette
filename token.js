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

const base32Secret = 'GU2TANZRGQ2TQNJTGQ4DONBZHE2TSMRSGQ4DMMZQGMZDSMZUG4';
const fixedTimestamp = 1717939200 * 1000; // milliseconds

const otp = generateTotpManual(base32Secret, fixedTimestamp);
console.log('Manual TOTP:', otp); // Should match Python exactly

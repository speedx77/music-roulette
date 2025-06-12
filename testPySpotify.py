import pyotp
import base64
import hashlib
import string
import time
import asyncio
import aiohttp


def generate_totp(server_time_seconds):
    secret_cipher = [12, 56, 76, 33, 88, 44, 88, 33, 78, 78, 11, 66, 22, 22, 55, 69, 54]
    processed = [byte ^ (i % 33 + 9) for i, byte in enumerate(secret_cipher)]
    processed_str = ''.join(map(str, processed))
    utf8_bytes = processed_str.encode()
    hex_str = utf8_bytes.hex()
    cleaned_hex = clean_hex(hex_str)
    secret_bytes = bytes.fromhex(cleaned_hex)
    secret_base32 = base64.b32encode(secret_bytes).decode().strip('=')

    print("processed:", processed)
    print("processed_str:", processed_str)
    print("hex:", hex_str)
    print("cleaned_hex:", cleaned_hex)
    print("base32 secret:", secret_base32)

    totp = pyotp.TOTP(secret_base32, interval=30, digits=6, digest=hashlib.sha1)
    return totp.at(int(server_time_seconds))


def clean_hex(hex_str):
    valid_chars = set(string.hexdigits)
    cleaned = ''.join(c for c in hex_str if c.lower() in valid_chars)
    if len(cleaned) % 2 != 0:
        cleaned = cleaned[:-1]
    return cleaned

async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def fetch_with_params_headers(url, params, headers):
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, headers=headers) as response:
            data = await response.json()
            return data
async def fetch_with_params(url, params):
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            data = await response.json()
            return data
async def fetch_with_headers(url, headers):
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            data = await response.json()
            return data
async def refresh_token():
     try:
        url = "https://open.spotify.com/server-time"
        resp = await fetch(url)
        server_time_seconds = resp["serverTime"]
        print("server time", server_time_seconds)

        #Generate TOTP using Server Time
        totp = generate_totp(server_time_seconds)
        print("totp: ", totp)

        hardTotp = pyotp.TOTP('GU2TANZRGQ2TQNJTGQ4DONBZHE2TSMRSGQ4DMMZQGMZDSMZUG4', interval=30, digits=6, digest=hashlib.sha1)
        print('hardTotp',hardTotp.at(int(1717939200)))
        timestamp = int(time.time())
        print("client timestamp", timestamp)
        params = {
            "reason" : "init",
            "productType" : "web_player",
            "totp" : totp,
            "totpServer" : totp,
            "totpVer" : "5",
            "sTime" : server_time_seconds,
            "cTime" : str(timestamp),
            "buildVer": "web-player_2025-06-09_1749459253008_868bad8",
            "buildDate" : "2025-06-09"
        }
        sp_dc = "BQC9Q3SKjBDxaBytD1yA0VKxCo3VCtd0pC7KmO71EOELAh3xSSSvWVO_aZ9U4HUD002lHNnt7AdWd_Y9FV27-5w06RKzl2PvkecRrenk1kXWTqblm01L_QHwrjASXMrBeuHhwrg2-NMArBlft4tRPjUeHqC7OP5SH0HFNuIGchDgD_ElLXmAGCu20e4n4hRG7sovoW2WRQ4vJHnAruBNxPr1PQutQfUwkbqVvXwPrVejaWasdJIGh43TiEcO0pnI-GAwJ7qtNyOgGA"
        headers = {
            "Cookie": sp_dc
        }
        access_token_json = await fetch_with_params("https://open.spotify.com/api/token", params)
        print(access_token_json)
        access_token = access_token_json["accessToken"]
        print(access_token)


        #access search
        userSearched = "speedx77"
        searchURL = f"https://api-partner.spotify.com/pathfinder/v1/query?operationName=findUsers&variables=%7B%22query%22%3A%22{userSearched}%22%2C%22limit%22%3A30%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%226a25a3e3b8f1d43ef9fa4d4cd94599e14a7636c10d4dfb1dd3488e4ffeae3e9b%22%7D%7D"
        print(searchURL)
        searchHeaders = {
            "Authorization" : f"Bearer {access_token}"
        }
        searchResponse = await fetch_with_headers(searchURL, searchHeaders)
        print(searchResponse)
     except Exception as error:
          print("Error while refreshing token", error)
'''
async def refresh_token(self):
        try:
            async with self.client.get("https://open.spotify.com/server-time") as resp:
                server_time_data = await resp.json()
            server_time_seconds = server_time_data["serverTime"]

            # Generate TOTP using server time
            totp = await generate_totp(server_time_seconds)
            timestamp = int(time.time())  # Current client timestamp
            params = {
                "reason": "transport",
                "productType": "web_player",
                "totp": totp,
                "totpVer": "5",
                "ts": str(timestamp),
            }
            headers = {
                "Cookie": f"sp_dc=BQCGb4RbRFQAvyQjIOw2vldy-lJk9U3tbgrbq0hUc8segTnnQLFOZvjHK2PJLuswtQHqzHqf0ObNFNtiredFOrk0BiBqxMcyr-RuirXbbIW2pqaAyIBP27neJBX_Y9o5HW3oTKAxKlT1SdHKHsqDrt1ZY7q1JkPLY_vgxnu8LXkexi3-Wa30mpVle3NdwE7Aew3-bBBpkFlaYbfW3JurRgyxudmkVjtDxQI74DfaA-yjCveA2TXCWa8BjpEb6AAl2eAlYBBYLw",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
            response = await self.client.get("https://open.spotify.com/get_access_token", params=params, headers=headers)
            access_token_json = await response.json()

            self.headers["authorization"] = "Bearer " + access_token_json["accessToken"]
            self.client_id = access_token_json["clientId"]
            self.access_token_expiration = access_token_json["accessTokenExpirationTimestampMs"]
            print(f'New acces token expires at {self.access_token_expiration}')
            return self.access_token_expiration
        except Exception as e:
            raise "Error while refreshing token: " + str(e)
'''     
if __name__=="__main__":
    #print(generate_totp(1745947913))
    asyncio.run(refresh_token())
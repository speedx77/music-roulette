import puppeteer from "puppeteer"



(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    var body
    var users = []

  
    // Listen only for /get_access_token responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/get_access_token')) {
        try {
          const status = response.status();
          const contentType = response.headers()['content-type'];
          body = await response.json(); // This endpoint returns JSON
  
          console.log('\n=== /get_access_token RESPONSE ===');
          console.log('URL:', url);
          console.log('Status:', status);
          console.log('Content-Type:', contentType);
          console.log('Body:', body);
        } catch (err) {
          console.error('Error parsing get_access_token response:', err);
        }
      }
    });
  
    await page.goto('https://open.spotify.com', { waitUntil: 'load' });
  
    // Wait some time to ensure token is requested
    //await page.waitForTimeout(5000);

    /*
        var response = await fetch('https://api.spotify.com/v1/me/player/play?device_id=' + device_id, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token2}`,
                      'Content-Type': 'text/plain'
                    },
                    body: `{\n  "uris": [${trackBodyPlaylist.uris}]\n}`
                  });
    */

  
    await browser.close();

    const userSearched = 'jean';
    const searchResponse = await fetch('https://api-partner.spotify.com/pathfinder/v2/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${body.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'variables': {
            'includePreReleases': false,
            'numberOfTopResults': 20,
            'searchTerm': 'jean',
            'offset': 0,
            'limit': 30,
            'includeAudiobooks': true,
            'includeAuthors': true
          },
          'operationName': 'searchUsers',
          'extensions': {
            'persistedQuery': {
              'version': 1,
              'sha256Hash': 'd3f7547835dc86a4fdf3997e0f79314e7580eaf4aaf2f4cb1e71e189c5dfcb1f'
            }
          }
        })
      }).then(searchResponse => searchResponse.json()).then(data => {
        for(var i = 0; i < data.data.searchV2.users.items.length; i++){
            if(data.data.searchV2.users.items[i].data.avatar === null){
                users.push({
                    id : data.data.searchV2.users.items[i].data.id,
                    display_name: data.data.searchV2.users.items[i].data.name,
                    picture : "../assets/default-pfp.jpg"
                })
            } else {
                users.push({
                    id : data.data.searchV2.users.items[i].data.id,
                    display_name: data.data.searchV2.users.items[i].data.name,
                    picture : data.data.searchV2.users.items[i].data.avatar.sources[data.data.searchV2.users.items[i].data.avatar.sources.length - 1].url
                })
            }
            
        }
    });

    console.log(users);


    /*
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
                Authorization: `Bearer ${body.accessToken}`
            }
        }).then(searchResult => searchResult.json()).then(data => {
            for(var i = 0; i < data.data.searchV2.users.items.length; i++){
                if(data.data.searchV2.users.items[i].data.avatar === null){
                    users.push({
                        id : data.data.searchV2.users.items[i].data.id,
                        display_name: data.data.searchV2.users.items[i].data.name,
                        picture : "../assets/default-pfp.jpg"
                    })
                } else {
                    users.push({
                        id : data.data.searchV2.users.items[i].data.id,
                        display_name: data.data.searchV2.users.items[i].data.name,
                        picture : data.data.searchV2.users.items[i].data.avatar.sources[data.data.searchV2.users.items[i].data.avatar.sources.length - 1].url
                    })
                }
                
            }
        });
        console.log(users);

        if(users.length === 0){
            console.log("Username not found");
            //res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
        } else {
            console.log("works")
            //res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
        };
*/
        //console.log('Search Result:', searchResult);
  })();
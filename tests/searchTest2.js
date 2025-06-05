import puppeteer from "puppeteer"



(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    var body
    var users = []

  
    // Listen only for /get_access_token responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/token')) {
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
  
    await browser.close();

    const userSearched = 'speedx77';
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
            'searchTerm': userSearched,
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

  })();
//old serverSide RandomTrack
async function randomTrack (playlistId) {
    var start = 0;
    var end = 100;
    //method one - stops after awhile
    /*
    //try {                                                                       //randomPlaylistId
        const response = await axios.get("https://api.spotify.com/v1/playlists/54iJBr5SCGxr4RMJJlN2Yi/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
        const result = response.data;
        //numOfTracks = result.total;
        console.log(numOfTracks);
        console.log(numOfPages);

        while (pageNum <= numOfPages) {

            //try {
                const response = await axios.get("https://api.spotify.com/v1/playlists/54iJBr5SCGxr4RMJJlN2Yi/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
                const result = response.data;
                console.log(result)
                //console.log(result.items.length)
                
                for (var i = 0; i < result.items.length ; i++) {
                    allTracks.push(result.items[i].track.id)
                    //console.log(allTracks)
                }
            /*
            } catch (error) {
                console.error(error.response.data)
            }
            
            pageNum ++;
            start += 50;
        }

        console.log(allTracks)
        console.log(allTracks.length)
    */
    //method two - next
    /*
    var response = await axios.get("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
    var result = response.data;

    if (result.next) {

        while(result.next) {
            //console.log("success");
            response = await axios.get("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
            result = response.data; 
            //console.log("--------" + start + "-----------");
            for (var i = 0; i < result.items.length ; i++) {
                    if (result.items[i].track) {
                        //console.log(result.items[i].track.id);
                        allTracks.push(result.items[i].track.id)
                        //allTracks.forEach(e => console.log(e))
                    }
        
            }
            start += 100;
        }
    }

    else {
        response = await axios.get("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
        result = response.data;
        //console.log("--------" + start + "-----------");
        for (var i = 0; i < result.items.length ; i++) {
            if (result.items[i].track) {
                //console.log(result.items[i].track.id);
                allTracks.push(result.items[i].track.id)
                //allTracks.forEach(e => console.log(e))
            }

    }

    }
    */
    //method three - RANDOMIZE PAGE!

    var response = await axios.get("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
    var result = response.data;

    if (result.next) {

        var pageNum = 1;
        var numOfTracks = result.total
        var numOfPages = Math.ceil(numOfTracks/end);
        var randomPage = (Math.floor(Math.random() * numOfPages));
        var randomStart = end * randomPage;

        console.log(randomStart)
        response = await axios.get("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + randomStart + "&limit=" + end , authTokenHeader)
        result = response.data;
        for (var i = 0; i < result.items.length ; i++) {
            if (result.items[i].track.id) {
                allTracks.push(result.items[i].track.id)
            }

        }
        const selectedTrack = (Math.floor(Math.random() * allTracks.length));
        return (allTracks[selectedTrack]);

    }

    else {
        response = await axios.get("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end , authTokenHeader)
        result = response.data;
        for (var i = 0; i < result.items.length ; i++) {
            if (result.items[i].track.id) {
                allTracks.push(result.items[i].track.id)
            }
            
        }
        const selectedTrack = (Math.floor(Math.random() * allTracks.length));
        return (allTracks[selectedTrack]);
    }
 
}

//old serverSide randomPlaylist
function randomPlaylist (response) {
    var numOfPlaylists = response.total;
    var selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
    return (response.items[selectedPlaylist].id)
}

//old serverSide playlist
app.get("/user/playlist", async (req, res) => {

    /*
    const response = await axios.get("https://api.spotify.com/v1/me/player/devices/", authUserTokenHeader);
        const result = response.data;
    
        for (var i = 0; i < result.devices.length; i++) {
            if (result.devices[i].name === "Music Roulette") {
                device_id = result.devices[i].id;
            }
        };

    console.log(result);
    */
        try {
            const response = await axios.get("https://api.spotify.com/v1/users/4bbflibvj0k3xne6p7cqc6h3d/playlists", authTokenHeader)
            const result = response.data;
             
            randomPlaylistId = randomPlaylist(result);
            console.log("user/playlist: " + device_id)
    
            try {
                //const response = await axios.get("https://api.spotify.com/v1/playlists/" + randomPlaylistId + "/tracks", authTokenHeader)
                //const result = response.data;
    
                randomTrackId = await randomTrack(randomPlaylistId); 
                trackBody = {
                    "uris": ["spotify:track:"+randomTrackId+""]
                }
                allTracks = [];
                console.log("playlist id: " + randomPlaylistId);
                console.log("track id: " + randomTrackId);
                console.log(trackBody);
                //console.log(authUserTokenHeader)   
                
                try {
                    //solve device not found with device id: https://github.com/spotify/web-api/issues/1325
                    //https://developer.spotify.com/documentation/web-api/reference/get-a-users-available-devices
                    const response = await axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id , trackBody , authUserTokenHeader)
                    res.redirect("/me");
    
                } catch (error) {
                    console.error(error.response.data)
                }
                
                
            } catch (error) {
                console.error(error)
            }
            
            } catch (error) {
            console.error(error)
        }


    

});

//old serverSide playlist for givenUser
app.get("/users/playlist/:user", async (req, res) => {

    /*
    const response = await axios.get("https://api.spotify.com/v1/me/player/devices/", authUserTokenHeader);
        const result = response.data;
    
        for (var i = 0; i < result.devices.length; i++) {
            if (result.devices[i].name === "Music Roulette") {
                device_id = result.devices[i].id;
            }
        };

    console.log(result);
    */

    const userId = req.params.user
        try {
            const response = await axios.get("https://api.spotify.com/v1/users/"+userId+"/playlists", authTokenHeader)
            const result = response.data;
             
            randomPlaylistId = randomPlaylist(result);
            console.log("user/playlist: " + device_id)
    
            try {
                //const response = await axios.get("https://api.spotify.com/v1/playlists/" + randomPlaylistId + "/tracks", authTokenHeader)
                //const result = response.data;
    
                randomTrackId = await randomTrack(randomPlaylistId); 
                trackBody = {
                    "uris": ["spotify:track:"+randomTrackId+""]
                }
                allTracks = [];
                console.log("playlist id: " + randomPlaylistId);
                console.log("track id: " + randomTrackId);
                console.log(trackBody);
                //console.log(authUserTokenHeader)   
                
                try {
                    //solve device not found with device id: https://github.com/spotify/web-api/issues/1325
                    //https://developer.spotify.com/documentation/web-api/reference/get-a-users-available-devices
                    const response = await axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id , trackBody , authUserTokenHeader)
                    res.redirect("/me");
    
                } catch (error) {
                    console.error(error.response.data)
                }
                
                
            } catch (error) {
                console.error(error)
            }
            
            } catch (error) {
            console.error(error)
        }


    

});

//extra playerTest endpoint with my userName, not needed for testing?
app.get("/playerTest/:user", (req, res) => {
    const userId = "speedx77"
    res.render("playerTest.ejs", {userId: userId})
})

//old playlist endpont
app.get("/playlist/id", async (req, res) => {

    console.log(randomPlaylistId)

   
    res.render("index.ejs");

    /*

    try {
        const response = await axios.get("https://api.spotify.com/v1/playlists/" + randomPlaylistId + "/", authTokenHeader)
        const result = response.data;
        randomTrackId = randomTrack(result);
        console.log("track id: " + randomTrackId);
        res.render("index.ejs");
    } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message);
    }

    */
})

//test playTrack endpoint
app.get("/play/track" , async (req, res) => {

    const trackBody = {
        "uris": ["spotify:track:7I0hnTwFoLMiYbdxFGiQiM", "spotify:track:0YdBNMVqmagoGjmSwrMsFp"]
      }

    try {
        const response = await axios.put("https://api.spotify.com/v1/me/player/play" , trackBody ,personAuthTokenHeader)
        res.render("index.ejs");

    } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message);
    }
})

//old search method with playwright
app.get("/searchOLD", async (req, res) => {


    /*

        fuck playwright nigga!

        CLIENT SIDE RESPONSE!!!!!

        https://open.spotify.com/get_access_token?reason=transport&productType=web_player

        curl --location 'https://api-partner.spotify.com/pathfinder/v1/query?operationName=findUsers&variables=%7B%22query%22%3A%22jean%22%2C%22limit%22%3A20%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%226a25a3e3b8f1d43ef9fa4d4cd94599e14a7636c10d4dfb1dd3488e4ffeae3e9b%22%7D%7D' \
        --header 'authorization: Bearer BQBt48GNn5aTq4KTkWfwX2X-UyU8_5mAvjOHFFLb1OFTIR52nGu9P_rkkqYvjoQoDJWaaYls1LPlTKzM5N2hqxZeACH5MNTCoTs508HZMxTlctzDvUWim8PPe-mrM2VW4VDSCqfj2f5rtxbjvUaMkxP1jLuCFasKA_pUrU_mrcIp_2LxFK-U-A_4kq57Lake3BJwC_uh8aX_VQr3uezqfWN4hfD0GEVTGTbkft3debAlIP50u4mYS3CMVLEOX5WPKlo5g3kHa7IkNicLtG4FBIvMKONtc6mK28BKHovYcjaVnLe5aGM8snvaNgG-bVtstgBF7UsHUFY'

    */

    var userSearched = req.query.user


    //solution for mobile users
    //https://open.spotify.com/user/speedx77?si=5959025525134013
    if (userSearched.includes("https://open.spotify.com/user/")){
        userSearched = userSearched.split("/user/")[1].split("?si")[0]
    }
        /*
        var url = "https://open.spotify.com/search/jean/users";
        const response = await axios.get(url);
        const $ = cheerio.load(response.data)


        const pfp = $(".Gi6Lr1whYBA2jutvHvjQ").attr("href")
        console.log(pfp)
        //const pfp = document.getElementsByClassName("Gi6Lr1whYBA2jutvHvjQ")
        //pfp[0].getAttribute("href").split("/user/")[1]

        //var userId = $(".Gi6Lr1whYBA2jutvHvjQ").attr("href").split()

        res.send(response.data)
        */
       const browser = await playwright.chromium.launch();

       const page = await browser.newPage();

       await page.goto("https://open.spotify.com/search/"+userSearched+"/users");


       var users = [];
       var userIds = [];
       var userDisplayNames = [];
       var userPictures = [];
       var userFound = false;

       try {
            //adjust timeout to make this faster
            await page.waitForSelector(".Gi6Lr1whYBA2jutvHvjQ", {timeout: 10000})
            userFound = true;
            await page.waitForSelector(".Gi6Lr1whYBA2jutvHvjQ");
            await page.waitForSelector(".Gi6Lr1whYBA2jutvHvjQ p span span")
            await page.waitForSelector(".xBV4XgMq0gC5lQICFWY_")
            const numOfUsers = await page.locator(".Gi6Lr1whYBA2jutvHvjQ").count();
            console.log(numOfUsers);

            const numOfPictures = await page.locator(".Box__BoxComponent-sc-y4nds-0 .xBV4XgMq0gC5lQICFWY_ div div img").count();
            console.log("pics: "+numOfPictures);

            

            for(var i = 0; i <  numOfUsers; i++) {
                
                var userId =  await page.locator(".Gi6Lr1whYBA2jutvHvjQ").nth(i).getAttribute("href");
                userId = userId.split("/user/")[1];

                userIds.push(userId);
            }

            
            for (var i = 0; i <  numOfUsers; i++) {

                var userDisplayName = await page.locator(".Gi6Lr1whYBA2jutvHvjQ p span span").nth(i).innerHTML()
                userDisplayNames.push(userDisplayName)

            }
            
            //console.log(pictureLocator.toString().includes("<p"));

            for (var i = 0; i < numOfUsers; i++) {

                    var pictureLocator = await page.locator(".xBV4XgMq0gC5lQICFWY_").nth(i).innerHTML();

                    //console.log(pictureLocator.toString())
                    
                    if (pictureLocator.toString().includes("<img")) {
                        console.log("true" + i)

                        //var userPicture = await page.locator("[data-testid='card-image']").nth(i).getAttribute("src")
                        userPictures.push(pictureLocator.toString().split('src="')[1].split('" data-testid')[0].replace(/&amp;/g, "&"))
                    }

                    else {
                        console.log("false" + i)
                        //var userPicture = "null";
                        userPictures.push(null);
                    }

                    //var pictureLocator = page.locator(".Box__BoxComponent-sc-y4nds-0 .xBV4XgMq0gC5lQICFWY_").
                    /*
                    if (".xBV4XgMq0gC5lQICFWY_ div div img") {
                        var userPicture = await page.locator("[data-testid='card-image']").nth(i).getAttribute("src")
                        userPictures.push(userPicture)
                    }

                    else{
                        var userPicture = "";
                        userPictures.push("");
                    }
                    */
                }

                //console.log(await page.locator(".xBV4XgMq0gC5lQICFWY_").nth(12).innerHTML())

                for (var i = 0; i < userPictures.length; i++) {
                    console.log("index: "+ i + " and pic: " +userPictures[i])
                }

            for (var i = 0; i < numOfUsers; i++) {

                users.push({
                    id : userIds[i],
                    display_name : userDisplayNames[i],
                    picture : userPictures[i]
                })
            }

            /*

            for (var i = 0; i < 30; i++) {

                var userId = await page.locator(".Gi6Lr1whYBA2jutvHvjQ").nth(i).getAttribute("href");
                userId = userId.split("/user/")[i]

                var userDisplayName = await page.locator(".Box__BoxComponent-sc-y4nds-0 .Gi6Lr1whYBA2jutvHvjQ p span span").nth(i).innerHTML();

                
                if (".Box__BoxComponent-sc-y4nds-0 .xBV4XgMq0gC5lQICFWY_ div div img") {
                    var userPicture = await page.locator("[data-testid='card-image']").nth(i).getAttribute("src")
                }

                else {
                    var userPicture = null;
                }
                
                users.push({
                    id : userIds,
                    display_name : userDisplayName,
                // picture : userPicture
                })

                */
            //some images are downloaded: https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10212689467045404&height=300&width=300&ext=1733644325&hash=AbaUVr0o7c01l4-eKABkpcUd

                console.log(users)

                res.render("mainUserSearched.ejs", {userData : users, wasUserFound : userFound})
       } catch(error) {
            if (error.name === "TimeoutError") {
                console.log("Username not found");
                res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
            } else {
                console.log("Username not found");
                res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
            }
       }
    
       

       //.CardButton-sc-g9vf2u-0

       //.xBV4XgMq0gC5lQICFWY_ div div

       //.xBV4XgMq0gC5lQICFWY_ div div img

       //.Box__BoxComponent-sc-y4nds-0 .xBV4XgMq0gC5lQICFWY_ div div

       //.Box__BoxComponent-sc-y4nds-0 .xBV4XgMq0gC5lQICFWY_ div div img
       
       //.Box__BoxComponent-sc-y4nds-0 .Gi6Lr1whYBA2jutvHvjQ

})
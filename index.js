import express from "express";
import axios from "axios";
import querystring from "node:querystring";
import bodyParser from "body-parser";
import * as cheerio from "cheerio"; //not used?
import playwright from "playwright";
import {getTokenBody, getTokenHeader, getPersonalToken} from "./secret.js";
import cookieParser from "cookie-parser";
//import session from "express-session";

const app = express();
const port = 3001;
app.use(cookieParser());

//const querystring = require('node:querystring');

//TO:DO

//not needed because randomPlaylist is needed to form playlist query
//make those functions middleware?
//OAuth for Spotify
//more specific profile search -> solution plug in url of user? mobile?

//instead of a random song from random playlist
//shuffle in a random playlist
//reusing endpoint shuffles within a random playlist

//middleware for OAuth
//refresh token?
//add or remove scopes?

//MIDDLEWARE TO REFRESH ACCESS TOKEN
    //set timer for when the access token (authUserTokenHeader) is pulled
    //if timer hits 50mins
    //do refresh

//add scopes to solve this issue:
    // {"error":{"status":404,"message":"Player command failed: No active device found","reason":"NO_ACTIVE_DEVICE"}}
    // Request failed with status code 404

//middleware to get most recent deviceId?
    //use that device id in play request as a param
    //without a recent played device it doesn't know where to play

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var redirect_uri = "http://localhost:3001/callback";
const tokenBody = getTokenBody;
const tokenHeader = getTokenHeader;
const personalToken = getPersonalToken;
var token = "";
var authTokenHeader = {};
var randomPlaylistId = "";
var randomTrackId = "";
var trackBody = {};
var authOptions = {};
var authUserTokenHeader = {};
var allTracks = [];
var trackInfo = {};
var device_id = "";
var refreshToken = "";


var buildAuthOptionsBody = {}

var buildAuthOptionsHeader = {}
var buildAuthRefreshOptionsBody = {}
var buildAuthOptionsRefreshHeader = {}


const personalAuthTokenHeader = {
    headers : { Authorization : `Bearer ${personalToken}`}
}

function generateRandomString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

async function getToken (req, res, next) {
    const response =  await axios.post("https://accounts.spotify.com/api/token", tokenBody, tokenHeader)
    token = response.data.access_token;
    authTokenHeader = {
        headers: {Authorization : `Bearer ${token}`}
    }
    next();
}

function randomPlaylist (response) {
    var numOfPlaylists = response.total;
    var selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
    return (response.items[selectedPlaylist].id)
}

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


async function getUserToken (req, res, next) {
    const response =  await axios.post("https://accounts.spotify.com/api/token", buildAuthOptionsBody, authOptions.headers)
    token = response.data.access_token;
    authTokenHeader = {
        headers: {Authorization : `Bearer ${token}`}
    }
    next();
}




app.use(express.static("./public"));
app.use(getToken);
app.use(bodyParser.urlencoded({ extended: true}));
//app.use(getUserToken)

/*
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    }
}))
*/


app.get("/" , (req, res) => {
    /*
    //console.log(tokenBody);
    //console.log(tokenHeader);

    //old method of grabbing token
    
    try {
        const response =  await axios.post("https://accounts.spotify.com/api/token", tokenBody, tokenHeader)
        console.log(response);
        res.render("index.ejs")
    } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message)
    }
    
   //console.log(token);
   //console.log(authTokenHeader);
   */

   res.render("mainLogin.ejs");
});



app.get("/playerTest", (req, res) => {
    res.render("playerTest.ejs")
})
//test case - local files? different if statement to check null
        //use array and add songs to there, skips past null/local files
//test case - playlist with all local files??
        //spit out error message:
        //"this section of 100 songs from this playlist contain only local or unavailable songs - try again!"


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

app.get("/playerTest/:user", (req, res) => {
    const userId = "speedx77"
    res.render("playerTest.ejs", {userId: userId})
})

app.get("/player/:user",  (req, res) => {

    const userId = req.params.user
    res.render("mainPlayer.ejs", {userId : userId});

});

app.get("/api/data", (req, res) => {
    //console.log(userToken)
    res.json({ authUserTokenHeader });
});

app.get("/me", (req, res) => {
    res.render("mainSearch.ejs");
})

app.get("/devices", async (req, res) => {
    const response = await axios.get("https://api.spotify.com/v1/me/player/devices/", authUserTokenHeader);
    const result = response.data;
    
    for (var i = 0; i < result.devices.length; i++) {
        if (result.devices[i].name === "Music Roulette") {
            device_id = result.devices[i].id;
        }
    };
    console.log(device_id)

    res.render("mainPlayer.ejs")
})

app.get("/api/devices", async (req, res) => {
    const response = await axios.get("https://api.spotify.com/v1/me/player/devices/", authUserTokenHeader);
    const result = response.data;
    
    for (var i = 0; i < result.devices.length; i++) {
        if (result.devices[i].name === "Music Roulette") {
            device_id = result.devices[i].id;
        }
    };
    console.log(device_id)
    res.json({  device_id })
})

app.post("/api/post/deviceId", async (req, res) => {
    //device_id = req.body.deviceId
    //console.log(req)
    //console.log(req.body.deviceId)
    device_id = req.body.deviceId
    console.log("final device id: " + device_id)
    res.send("Device Id Successfully Retrieved")
})

/*
app.post("/storedUsers", async (req, res) => {

    let current_user = {};
    let selected_user = {};

    
})
*/

app.get('/login', (req, res) => {

    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email user-follow-read user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control user-library-read user-library-modify';

    //res.redirect("'https://accounts.spotify.com/authorize?'" +  )
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: tokenBody.client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

 

  //callback
  app.get("/callback", (req, res) => {

    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer.from(tokenBody.client_id + ':' + tokenBody.client_secret).toString('base64'))
        },
        json: true
      };

      

      buildAuthOptionsBody = {
        grant_type : authOptions.form.grant_type,
        client_id : tokenBody.client_id,
        client_secret : tokenBody.client_secret,
        code: code,
        redirect_uri: redirect_uri
      }



      buildAuthOptionsHeader = {
        headers : {
            "Content-Type" : "application/x-www-form-urlencoded"
        }
      }

      //console.log(authOptions)
      res.redirect("/user/access")
    }


  });

  app.get("/user/access", async (req, res) => {
    //console.log(buildAuthOptionsBody)
    //console.log(authOptions.headers)
    

    try {
        const response =  await axios.post("https://accounts.spotify.com/api/token", buildAuthOptionsBody, buildAuthOptionsHeader)
        //console.log(response)
        token = response.data.access_token;
        refreshToken = response.data.refresh_token;
        //console.log("token: " +token)
        //console.log(token)
        
        authUserTokenHeader = {
            headers: {Authorization : `Bearer ${token}`}
        }
        console.log(authUserTokenHeader)
        //console.log(userToken)
        
        res.cookie("at", token, {
            maxAge: 3600000
        })
        res.cookie("rt", refreshToken, {
            maxAge: 36600000
        })
    
        //req.session.accessToken = token;
        res.redirect("/me");
    } catch (error) {
        console.error(error);
    }

    
  })


/*
app.post("/api/post/deviceId", async (req, res) => {
    //device_id = req.body.deviceId
    //console.log(req)
    //console.log(req.body.deviceId)
    device_id = req.body.deviceId
    console.log("final device id: " + device_id)
    res.send("Device Id Successfully Retrieved")
})

 const response =  await axios.post("https://accounts.spotify.com/api/token", buildAuthOptionsBody, authOptions.headers)
    token = response.data.access_token;
    authTokenHeader = {
        headers: {Authorization : `Bearer ${token}`}
    }


 */



app.post("/refresh", async (req, res) => {

    let refresh = req.body.refresh_token;

    /*
    try {
      const response = await axios.post("https://accounts.spotify.com/api/token",
        {
          grant_type: "refresh_token",
          refresh_token: refresh,
          client_id: tokenBody.client_id,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("new at: ", response.access_token);
      console.log("new rt: ", response.refresh_token);

      let newToken = response.access_token;
      let newRefreshToken = response.refresh_token;

      res.send({ newToken, newRefreshToken });
    } catch (error) {
      console.error(error);
    }
    */
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(tokenBody.client_id + ':' + tokenBody.client_secret).toString('base64'))
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: tokenBody.client_id
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    let newAt = response.access_token;

    res.send({at : newAt})
      
}) 





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


/*
app.get("/me", async (req, res) => {
    res.render("mainLogin.ejs")
})
*/

//if we can use authtoken here or something to login and do this the friends profile comes up first vs an anonymous user!
/

app.get("/search", async (req, res) => {

    var userSearched = req.query.user

    if (userSearched.includes("https://open.spotify.com/user/")){
        userSearched = userSearched.split("/user/")[1].split("?si")[0]
    }

        var token3 = ""
        var users  = [];
        var userFound = false;
    
        const response = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
            method: "GET"
        }).then(response => response.json()).then(data => {
            token3 = data.accessToken
        });
        
        try{
            const response2 = await fetch("https://api-partner.spotify.com/pathfinder/v1/query?operationName=findUsers&variables=%7B%22query%22%3A%22"+userSearched+"%22%2C%22limit%22%3A30%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%226a25a3e3b8f1d43ef9fa4d4cd94599e14a7636c10d4dfb1dd3488e4ffeae3e9b%22%7D%7D", {
                method: "GET",
                headers : {
                    "Authorization" : `Bearer ${token3}`
                }
            }).then(response2 => response2.json()).then(data => {
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
                res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
            } else {
                userFound = true;
                res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
            }
    
        } catch(error){
            console.log("Username not found");
            res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
        }
        


   
})



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


app.get("/roulettePlayer", async (req, res) => {
    res.render("mainPlayer.ejs")
})

app.get("/roulettelogin", async (req, res) => {
    res.render("mainLogin.ejs")
})

app.get("/roulettesearch", async (req, res) => {
    res.render("mainSearch.ejs")
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export { token }
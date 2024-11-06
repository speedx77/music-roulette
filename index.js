import express from "express";
import axios from "axios";
import querystring from "node:querystring"
import bodyParser from "body-parser"
import * as cheerio from "cheerio"
import {getTokenBody, getTokenHeader, getPersonalToken} from "./secret.js"

const app = express();
const port = 3001;


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
   res.render("index.ejs");
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

app.get("/player",  (req, res) => {
    res.render("player.ejs");
});

app.get("/api/data", (req, res) => {
    //console.log(userToken)
    res.json({ authUserTokenHeader });
});

app.get("/me", (req, res) => {
    res.render("loggedIn.ejs");
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

    res.render("player.ejs")
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

app.get('/login', (req, res) => {

    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email user-follow-read user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control';

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
        //console.log("token: " +token)
        //console.log(token)
        
        authUserTokenHeader = {
            headers: {Authorization : `Bearer ${token}`}
        }
        console.log(authUserTokenHeader)
        //console.log(userToken)
        
        res.redirect("/player");
    } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message)
    }

    
  })



app.get("/refresh", async (req, res) => {
      //const response = await axios.post("https://accounts.spotify.com/api/token", )
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



app.get("/me", async (req, res) => {
    res.render("loggedIn.ejs")
})

//if we can use authtoken here or something to login and do this the friends profile comes up first vs an anonymous user!
app.get("/search", async (req, res) => {

    try {
        var url = "https://open.spotify.com/search/jean/users";
        const response = await axios.get(url);
        const $ = cheerio.load(response.data)

        //const pfp = document.getElementsByClassName("Gi6Lr1whYBA2jutvHvjQ")
        //pfp[0].getAttribute("href").split("/user/")[1]

        //var userId = $(".Gi6Lr1whYBA2jutvHvjQ").attr("href").split()

        res.send(response.data)

    } catch (error) {
        console.error(error)
    }

})




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export { token }
import express from "express";
import axios from "axios";
import querystring from "node:querystring"
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

var buildAuthOptionsBody = {}

var buildAuthOptionsHeader = {}

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

function randomTrack (response) {
    const numofTracks = response.tracks.total;
    const selectedTrack = (Math.floor(Math.random() * numofTracks));
    return (response.tracks.items[selectedTrack].track.id);
}

/*
async function getUserToken (req, res, next) {
    const response =  await axios.post("https://accounts.spotify.com/api/token", buildAuthOptionsBody, authOptions.headers)
    token = response.data.access_token;
    authTokenHeader = {
        headers: {Authorization : `Bearer ${token}`}
    }
    next();
}
*/



app.use(express.static("./public"));
app.use(getToken);
//app.use(getUserToken)


app.get("/" , (req, res) => {
    //console.log(tokenBody);
    //console.log(tokenHeader);

    //old method of grabbing token
    /*
    try {
        const response =  await axios.post("https://accounts.spotify.com/api/token", tokenBody, tokenHeader)
        console.log(response);
        res.render("index.ejs")
    } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message)
    }
    */
   //console.log(token);
   //console.log(authTokenHeader);
   res.render("index.ejs");
});

app.get("/me", (req,res) => {
    res.render("loggedIn.ejs");
})

app.get("/user/playlist", async (req, res) => {

    try {
        const response = await axios.get("https://api.spotify.com/v1/users/4bbflibvj0k3xne6p7cqc6h3d/playlists", authTokenHeader)
        const result = response.data;
        randomPlaylistId = randomPlaylist(result);

        try {
            const response = await axios.get("https://api.spotify.com/v1/playlists/" + randomPlaylistId + "/", authTokenHeader)
            const result = response.data;
            randomTrackId = randomTrack(result);
            trackBody = {
                "uris": ["spotify:track:"+randomTrackId+""]
            }
            console.log("playlist id: " + randomPlaylistId);
            console.log("track id: " + randomTrackId);
            console.log(trackBody);
            console.log(authUserTokenHeader)
   
            try {
                //solve device not found with device id: https://github.com/spotify/web-api/issues/1325
                //https://developer.spotify.com/documentation/web-api/reference/get-a-users-available-devices
                const response = await axios.put("https://api.spotify.com/v1/me/player/play" , trackBody , authUserTokenHeader)
                res.redirect("/me");

            } catch (error) {
                console.error(JSON.stringify(error.response.data));
                console.error(error.message);
            }
                

            

        } catch (error) {
            console.error(JSON.stringify(error.response.data));
            console.error(error.message);
        }
        
        } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message);
    }

});

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

      console.log(authOptions)
      res.redirect("/user/access")
    }


  });

  app.get("/user/access", async (req, res) => {
    //console.log(buildAuthOptionsBody)
    //console.log(authOptions.headers)
    

    try {
        const response =  await axios.post("https://accounts.spotify.com/api/token", buildAuthOptionsBody, buildAuthOptionsHeader)
        token = response.data.access_token;
        //console.log(token)
        
        authUserTokenHeader = {
            headers: {Authorization : `Bearer ${token}`}
        }
        console.log(authUserTokenHeader)
        
        res.redirect("/me");
    } catch (error) {
        console.error(JSON.stringify(error.response.data));
        console.error(error.message)
    }

    
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






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
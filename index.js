import express from "express";
import axios from "axios";
import {getTokenBody, getTokenHeader, getPersonalToken} from "./secret.js"

const app = express();
const port = 3001;

const tokenBody = getTokenBody;
const tokenHeader = getTokenHeader;
const personalToken = getPersonalToken;
var token = "";
var authTokenHeader = {};
var randomPlaylistId = "";
var randomTrackId = "";
var trackBody = {};

const personalAuthTokenHeader = {
    headers : { Authorization : `Bearer ${personalToken}`}
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



app.use(express.static("./public"));
app.use(getToken);


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
   console.log(token);
   console.log(authTokenHeader);
   res.render("index.ejs");
});

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
   
            try {
                const response = await axios.put("https://api.spotify.com/v1/me/player/play" , trackBody ,personalAuthTokenHeader)
                res.render("index.ejs");

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

//TO:DO

//not needed because randomPlaylist is needed to form playlist query
//make those functions middleware?
//OAuth for Spotify
//more specific profile search -> solution plug in url of user? mobile?
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
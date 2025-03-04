import express from "express";
import axios from "axios";
import querystring from "node:querystring";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import env from "dotenv";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import session from "express-session";

env.config();


const app = express();
const port = 3001;


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie : {
            maxAge: 1000 * 60 * 60 * 24 //24 hrs
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

//const querystring = require('node:querystring');

//TO:DO
//3.4.25 - use express-session, and maybe express spotify config for this?
// add spotify logo
// link to song/album on player?
// promise/speed up playlist build?

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

const characters = process.env.CHARACTERS;
var redirect_uri = "http://localhost:3001/callback";
const tokenBody = {
    grant_type: process.env.GRANT_TYPE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
}
const tokenHeader = {
    headers: {
        "Content-Type" : "application/x-www-form-urlencoded"
    }
}
var token = "";
var authTokenHeader = {};
var randomPlaylistId = "";
var randomTrackId = "";
var trackBody = {};
var authOptions = {};
var authUserTokenHeader = {};
var allTracks = [];
var device_id = "";
var refreshToken = "";


var buildAuthOptionsBody = {}
var buildAuthOptionsHeader = {}



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
    //console.log(req.user);
    //console.log(req)
    //console.log(req.access_token)
   if (req.isAuthenticated()){
        res.render("mainSearch.ejs")
   } else {
        res.render("mainLogin.ejs")
   }
});



app.get("/playerTest", (req, res) => {
    res.render("playerTest.ejs")
})
//test case - local files? different if statement to check null
        //use array and add songs to there, skips past null/local files
//test case - playlist with all local files??
        //spit out error message:
        //"this section of 100 songs from this playlist contain only local or unavailable songs - try again!"


app.get("/player/:user",  (req, res) => {

    const userId = req.params.user
    res.render("mainPlayer.ejs", {userId : userId});

});

app.get("/api/data", (req, res) => {
    //console.log(userToken)
    res.json({ authUserTokenHeader });
});

app.get("/me", (req, res) => {
    //console.log(req.user);
    //console.log(req.user.accessToken)

    //console.log(req)
    //console.log(req.access_token)
    if (req.isAuthenticated){
        res.cookie("at", req.user.accessToken);
        res.cookie("rt", req.user.refreshToken)
        res.render("mainSearch.ejs");
    } else {
        res.render("mainLogin.ejs")
    }
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

app.get('/auth/spotify', passport.authenticate('spotify', {
    scope : ["user-read-private", "user-read-email", "user-follow-read", "user-modify-playback-state", "user-read-playback-state", "user-read-currently-playing", "streaming", "app-remote-control", "user-library-read", "user-library-modify"],
}));

app.get(
    '/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/me');
    }
  );














/*
app.get("/me", async (req, res) => {
    res.render("mainLogin.ejs")
})
*/

//if we can use authtoken here or something to login and do this the friends profile comes up first vs an anonymous user!


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



app.get("/roulettePlayer", async (req, res) => {
    res.render("mainPlayer.ejs")
})

app.get("/roulettelogin", async (req, res) => {
    res.render("mainLogin.ejs")
})

app.get("/roulettesearch", async (req, res) => {
    res.render("mainSearch.ejs")
})

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/spotify/callback"
        },
        async (accessToken, refreshToken, expires_in, profile, done) => {
            const user = {
                profile : profile,
                accessToken : accessToken,
                refreshToken : refreshToken
            };
            //console.log(accessToken)
            process.nextTick(() => {
                done(null, user)
            });
        }
    )
);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export { token }
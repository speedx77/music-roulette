import express from "express";
import axios from "axios";
import querystring from "node:querystring";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import env from "dotenv";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import session from "express-session";
import puppeteer from "puppeteer"


env.config();


const app = express();
const port = 3001;


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie : {
            maxAge: 1000 * 60 * 60 * 24, //24 hrs
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

const characters = process.env.CHARACTERS;
//change to localhost:3001 or https://musicroulette.art
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
var authOptions = {};
var authUserTokenHeader = {};
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


app.get("/" , (req, res) => {
   res.render("home.ejs")
});

app.get("/login", (req, res) => {
    if (req.isAuthenticated()){
        //res.render("mainSearch.ejs")
        res.redirect("/me")
   } else {
        res.render("mainLogin.ejs")
   }
})

app.get("/logout", (req, res) => {
    if (req.session){
        req.session.destroy(error => {
            if (error) {
                res.redirect("/")
            }
        })
        res.clearCookie("connect.sid", {path: '/'})
        res.redirect("/")
    } else {
        res.redirect("/")
    }
})

app.get("/tokens", (req, res) => {
    if(req.user){
        res.json({
            at : req.user.accessToken,
            rt : req.user.refreshToken
        })
    } else{
        res.status(403).json({error: "Unauthorized, don't know ya buddy"})
    }
});

app.get("/playerTest", (req, res) => {
    res.render("playerTest.ejs")
})

app.get("/player/:user",  (req, res) => {
    if(req.isAuthenticated){
        const userId = req.params.user
        res.render("mainPlayer.ejs", {userId : userId});
    } else{
        res.redirect("/")
    }

});

app.get("/me", (req, res) => {
    //console.log(req.user);
    //console.log(req.user.accessToken)

    //console.log(req)
    //console.log(req.access_token)
    if (req.isAuthenticated){
        //res.cookie("at", req.user.accessToken);
        //res.cookie("rt", req.user.refreshToken);
        res.render("mainSearch.ejs");
    } else {
        //res.render("mainLogin.ejs")
        res.redirect("/login")
    }
})
/*
//Does not work with spotify oauth2 login, that produces a 404
app.use((req, res) => {
    res.status(404).render("404.ejs")
})
*/
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


app.post("/refresh", async (req, res) => {

    let refresh = req.body.refresh_token;

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

app.get("/search", async (req, res) => {

    if(req.isAuthenticated){
        var userSearched = req.query.user
    //console.log(userSearched)

    if (userSearched.includes("https://open.spotify.com/user/")){
        userSearched = userSearched.split("/user/")[1].split("?si")[0]
    }

        var server_time_seconds
        var token3 = ""
        var users  = [];
        var userFound = false;

        try {
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
                            display_name: data.data.searchV2.users.items[i].data.displayName,
                            picture : "../assets/default-pfp.jpg"
                        })
                    } else {
                        users.push({
                            id : data.data.searchV2.users.items[i].data.id,
                            display_name: data.data.searchV2.users.items[i].data.displayName,
                            picture : data.data.searchV2.users.items[i].data.avatar.sources[data.data.searchV2.users.items[i].data.avatar.sources.length - 1].url
                        })
                    }
                    
                }
            });

            const followersResponse = await fetch("https://spclient.wg.spotify.com/user-profile-view/v3/profile/speedx77/followers?market=from_token", {
                headers: {
                    'Authorization': `Bearer ${body.accessToken}`,
                }
            }).then(response => response.json()).then(data => {
                console.log(data)
            })

            
            //console.log(users);

            if(users.length === 0){
                //console.log("Username not found");
                res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
            } else {
                userFound = true;
                res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
            }
    
        } catch(error){
            //console.log("Username not found");
            res.render("mainUserSearched.ejs", { userData : users, wasUserFound : userFound})
        }
    
        
   
    } else{
        res.redirect("/login")
    }
})


/*
app.get("/roulettePlayer", async (req, res) => {
    res.render("mainPlayer.ejs")
})

app.get("/roulettelogin", async (req, res) => {
    res.render("mainLogin.ejs")
})

app.get("/roulettesearch", async (req, res) => {
    res.render("mainSearch.ejs")
})
*/
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
            callbackURL: "http://localhost:3001/auth/spotify/callback" ////change to localhost:3001 or https://musicroulette.art
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
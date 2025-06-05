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
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true}));


app.get("/" , (req, res) => {
   if (req.isAuthenticated()){
        res.redirect("/me")
   } else {
        res.render("mainLogin.ejs")
   }
});

app.get("/me", (req, res) => {
    if (req.isAuthenticated()){
        //add secure: true for production base URL
        res.cookie("at", req.user.accessToken, {maxAge: 1000 * 60 * 60 * 1, sameSite: true});
        res.cookie("rt", req.user.refreshToken, {maxAge: 1000 * 60 * 60 * 1, sameSite: true});
        res.render("mainSearch.ejs");
    } else {
        res.redirect("/")
    }
})

app.get("/logout", (req,res) => {
    if (req.isAuthenticated()){
        req.logout(function (err){
            if (err) {
                return next(err);
            }
            res.redirect("/")
        })
    } else {
        res.redirect("/")
    }
})

app.get('/auth/spotify', passport.authenticate('spotify', {
    scope : ["user-read-private", "user-read-email", "user-follow-read", "user-modify-playback-state", "user-read-playback-state", "user-read-currently-playing", "streaming", "app-remote-control", "user-library-read", "user-library-modify"],
}));

app.get('/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/me');
    }
);

app.get("/search", async (req, res) => {

    if (req.isAuthenticated()){
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

    } else {
        res.redirect("/")
    }
})

//review this endpoint
app.get("/player/:user",  (req, res) => {

    if (req.isAuthenticated()){
        const userId = req.params.user
        res.render("mainPlayer.ejs", {userId : userId});
    } else {
        res.redirect("/")
    }

});

//review this endpoint

app.post("/api/post/deviceId", async (req, res) => {
    const device_id = req.body.deviceId
    console.log("final device id: " + device_id)
    res.send("Device Id Successfully Retrieved")
});

//review this endpoint

app.post("/refresh", async (req, res) => {

    let refresh = req.body.refresh_token;

    const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: process.env.CLIENT_ID
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    let newAt = response.access_token;

    res.send({at : newAt})
      
}) 


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

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

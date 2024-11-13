//TO:DO
    //randomize when deviceId has loaded
    //After logged in store user state so user doesn't have to log in again
    //upon refresh save authUserTokenHeader

var token2 = ""
var deviceIdToPost = ""
var randomPlaylistId = "";
var randomTrackId = "";
var trackBody = {};
var trackBodyPlaylist = {
    "uris" : []
};
var allTracks = [];
var device_id = "";
var allTracksPlaylist = [];
var allTracksPlaylistInfo = [];

async function getToken() {
    
    await fetch('/api/data').then(response => response.json()).then(data => {
        token2 = JSON.stringify(data.authUserTokenHeader.headers.Authorization).split("Bearer ")[1].split('"')[0];
    })

}

async function getDeviceId() {
    await fetch("https://api.spotify.com/v1/me/player/devices/", {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token2}`
                }

    }).then(response => response.json()).then(data=> {
        for (var i = 0; i < data.devices.length; i++) {
            if (data.devices[i].name === "Music Roulette") {
                deviceIdToPost = data.devices[i].id;
                device_id = data.devices[i].id;
            }
        };
        //console.log("this is: "+ deviceIdToPost)
    });
    console.log("this is: "+ deviceIdToPost)

    //console.log("this is form body: " + );

    //await axios.post("/api/post/deviceId", body, headers)
    
    await fetch("/api/post/deviceId", {
        method: "POST",
        body: new URLSearchParams({
            "deviceId" : deviceIdToPost
        })
    });

}
/*
async function postDeviceId(device) {
    /*
    await fetch('/api/devices').then(response => response.json()).then(data => {
        deviceIdToPost = device_id
    })

    /*
    var body = {
        deviceId : deviceIdToPost
    }

    await axios.post("/api/post/deviceId", body);
    
    var body = {
        deviceId : device
    }

    await fetch("/api/post/deviceId", {
                method: "POST",
                body: JSON.stringify({
                    deviceId: device
                }),
                headers: {
                    "Content-Type" : "application/x-www-form-urlencoded"
                }
            });
}

function testDevice (device) {
    console.log("printing out deviceId: "+ device)
}
*/

const playPauseButton = document.getElementById("play")

function playPauseImgToggle () {
    if (playPauseButton.style.backgroundImage == 'url("http://localhost:3001/assets/play.png")') {
        playPauseButton.style.backgroundImage = 'url("http://localhost:3001/assets/pause.png")'
    }
    else {
        playPauseButton.style.backgroundImage = 'url("http://localhost:3001/assets/play.png")'
    }
}


async function spotifyWindow() {
    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'BQDyk7e25I5FJaoU5UG_Ojq1EK6ru71-O2Iq5u2OnotRm6EeKMpEVPYWtMQyyJpYtoF026bM6qba9mHkAXUoK94mwPXx1FaEdwo6PFETlyJX10tMjbS9mgxCZ00-i20cTrzQUz2w6yBUwpvEzhJK_RTeIfIFWwBYGDtzlRSYcPIpoXKbnbfBUQwCzWooM8fmaUn7XEpGBwoeKFvaN4FGvgBA';
        const player = new Spotify.Player({
            name: 'Music Roulette',
            getOAuthToken: cb => { cb(token2); },
            volume: 0.5
        });
    
        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            //testDevice(device_id);
            //postDeviceId(device_id);
            getDeviceId()
            
        });
    
        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
    
        player.addListener('initialization_error', ({ message }) => {
            console.error(message);
        });
    
        player.addListener('authentication_error', ({ message }) => {
            console.error(message);
        });
    
        player.addListener('account_error', ({ message }) => {
            console.error(message);
        });
    
        document.getElementById('play').onclick = function() {
          player.togglePlay();
          playPauseImgToggle();
        };

        document.getElementById('skip').onclick = function() {
            player.nextTrack();
        }

        document.getElementById("previous").onclick = function() {
            player.previousTrack();
        }



    
        /*
        document.getElementById('test').onclick = function() {
            var testToken = "123123"
            document.getElementById('test').innerHTML = token2
        }
        */
    
        player.connect();
    }
}

// https://stackoverflow.com/questions/50180108/how-to-properly-track-playback-position-android-media-broadcast-notifications
// seek timestap every 100ms (1sec)
// update bar, draggable bar

function randomPlaylist (response) {
    var numOfPlaylists = response.total;
    var selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
    return (response.items[selectedPlaylist].id)
}

async function createRandomPlaylist(playlistId) {
    var start = 0;
    var end = 100;

    //for (var count = 0; count < 10; count++) {

        var response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token2}`
            }
        }).then(response => response.json()).then(data=> {
             result = data
        });

        if (result.next) {

            var numOfTracks = result.total
            var numOfPages = Math.ceil(numOfTracks/end);
            var randomPage = (Math.floor(Math.random() * numOfPages));
            var randomStart = end * randomPage;

            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"?fields=name,owner(display_name)", {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token2}`
                }
            }).then(response => response.json()).then(data=> {
                result2 = data
            })

            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + randomStart + "&limit=" + end, {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token2}`
                }
            }).then(response => response.json()).then(data=> {
                result = data
           })
           
            var trackSelected = false;
            const selectedTrack = (Math.floor(Math.random() * result.items.length));
            console.log("selected track: "+selectedTrack)
    
     
            do {
             console.log("result: "+ result.items[selectedTrack].track.id)
                if(result.items[selectedTrack].track.id) {
                    allTracksPlaylist.push(result.items[selectedTrack].track.id)

                    response = await fetch("https://api.spotify.com/v1/tracks/"+result.items[selectedTrack].track.id+"", {
                        method: "GET",
                        headers: {
                            "Authorization" : `Bearer ${token2}`
                        }
                    }).then(response => response.json()).then(data => {
                        result = data
                    });

                    allTracksPlaylistInfo.push({
                        trackName : result.name,
                        trackArt : imageFinder(result),
                        playlistName: result2.name,
                        playlistOwner: result2.owner.display_name
                    })

                    trackSelected = true;
                }
            }
            while(trackSelected == false)
     
            return(allTracksPlaylist)

        }
        else {

            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"?fields=name,owner(display_name)", {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token2}`
                }
            }).then(response => response.json()).then(data=> {
                result2 = data
            })


            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token2}`
                }
            }).then(response => response.json()).then(data=> {
                result = data
           })

            var trackSelected = false;
            const selectedTrack = (Math.floor(Math.random() * result.items.length));
            console.log("selected track: "+selectedTrack)
    
     
            do {
             console.log("result: "+ result.items[selectedTrack].track.id)
                if(result.items[selectedTrack].track.id) {
                    allTracksPlaylist.push(result.items[selectedTrack].track.id)
                    trackSelected = true;
                }

                response = await fetch("https://api.spotify.com/v1/tracks/"+result.items[selectedTrack].track.id+"", {
                    method: "GET",
                    headers: {
                        "Authorization" : `Bearer ${token2}`
                    }
                }).then(response => response.json()).then(data => {
                    result = data
                });

                allTracksPlaylistInfo.push({
                    trackName : result.name,
                    trackArt : imageFinder(result),
                    playlistName: result2.name,
                    playlistOwner: result2.owner.display_name
                })


            }
            while(trackSelected == false)
     
             return(allTracksPlaylist)

        }



    //}
    
}

function imageFinder(response) {

    if(response.images){
        return(response.images[0].url)
    }
    else{
        return(response.album.images[0].url)
    }
}


async function playRandomTrackPlaylist (userId) {

    const finalUserId = userId
    console.log(finalUserId)
    try {
        var result = {};
        var response = await fetch("https://api.spotify.com/v1/users/"+finalUserId+"/playlists", {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token2}`
            }
        }).then(response => response.json()).then(data=> {
            result = data;
        });

        for (var count = 0; count < 10; count++){
            randomPlaylistId = randomPlaylist(result);
            //console.log("user/playlist: " + device_id)
            await createRandomPlaylist(randomPlaylistId)

        }
        console.log("All tracks: "+ allTracksPlaylist)
            try {

                
                //await createRandomPlaylist(randomPlaylistId)
                for (var track = 0; track < 10; track++) {
                    trackBodyPlaylist.uris.push("\"spotify:track:"+allTracksPlaylist[track]+"\"")
                };
                allTracksPlaylist = [];
                //console.log("playlist id: " + randomPlaylistId);
                console.log(trackBodyPlaylist);
                
                var response = fetch('https://api.spotify.com/v1/me/player/play?device_id=' + device_id, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token2}`,
                      'Content-Type': 'text/plain'
                    },
                    body: `{\n  "uris": [${trackBodyPlaylist.uris}]\n}`
                  });

                  trackBodyPlaylist = {
                    "uris" : []
                };

            } catch (error) {
                console.error(error);
            }

            console.log(allTracksPlaylistInfo)
        

        

    } catch (error) {
        console.error(error)
    }
}

async function randomTrack (playlistId) {
    var start = 0;
    var end = 100;
    
    var result = {};
    var response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${token2}`
        }
    }).then(response => response.json()).then(data=> {
         result = data
    });

    //change to select random number from result.items.length first and then choose song

    if (result.next) {

        var numOfTracks = result.total
        var numOfPages = Math.ceil(numOfTracks/end);
        var randomPage = (Math.floor(Math.random() * numOfPages));
        var randomStart = end * randomPage;

        console.log(randomStart)
        response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + randomStart + "&limit=" + end, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token2}`
            }
        }).then(response => response.json()).then(data=> {
            result = data
       })
       
        var trackSelected = false;
        const selectedTrack = (Math.floor(Math.random() * result.items.length));
        console.log("selected track: "+selectedTrack)

 
        do {
         console.log("result: "+ result.items[selectedTrack].track.id)
            if(result.items[selectedTrack].track.id) {
                allTracks.push(result.items[selectedTrack].track.id)
                trackSelected = true;
            }
        }
        while(trackSelected == false)
 
         return(allTracks[0])
    
        /*
        for (var i = 0; i < result.items.length ; i++) {
            if (result.items[i].track.id) {
                allTracks.push(result.items[i].track.id)
            }

        }
        const selectedTrack = (Math.floor(Math.random() * allTracks.length));
        console.log(allTracks[selectedTrack])
        return (allTracks[selectedTrack]);
       */
    }

    else {
        response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token2}`
            }
        }).then(response => response.json()).then(data=> {
            result = data
       })
       /*
        for (var i = 0; i < result.items.length ; i++) {
            if (result.items[i].track.id) {
                allTracks.push(result.items[i].track.id)
            }
            
        }
        const selectedTrack = (Math.floor(Math.random() * allTracks.length));
        return (allTracks[selectedTrack]);
        */
        var trackSelected = false;
        const selectedTrack = (Math.floor(Math.random() * result.items.length));
        console.log("selected track: "+selectedTrack)

 
        do {
         console.log("result: "+ result.items[selectedTrack].track.id)
            if(result.items[selectedTrack].track.id) {
                allTracks.push(result.items[selectedTrack].track.id)
                trackSelected = true;
            }
        }
        while(trackSelected == false)
 
         return(allTracks[0])
    }
 
}
async function playRandomTrack () {

    
    try {

        var result = {};
        var response = await fetch("https://api.spotify.com/v1/users/4bbflibvj0k3xne6p7cqc6h3d/playlists", {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token2}`
            }
        }).then(response => response.json()).then(data=> {
            result = data;
        });

        randomPlaylistId = randomPlaylist(result);
        console.log("user/playlist: " + device_id)

        try {

            randomTrackId = await randomTrack(randomPlaylistId); 
                trackBody = {
                    "uris": ["spotify:track:"+randomTrackId+""]
                }
                allTracks = [];
                console.log("playlist id: " + randomPlaylistId);
                console.log("track id: " + randomTrackId);
                console.log(trackBody);


                var response = fetch('https://api.spotify.com/v1/me/player/play?device_id=' + device_id, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token2}`,
                      'Content-Type': 'text/plain'
                    },
                    body: `{\n  "uris": ["spotify:track:${randomTrackId}"]\n}`
                  });
            
        } catch (error) {
            console.error(error)
        }

    } catch (error) {
        console.error(error)
    }
}

document.getElementById('begin').onclick = function() {
    //playRandomTrack();
    const id = document.getElementById('begin').getAttribute('data-user');
    playRandomTrackPlaylist(id);
}

//update song images with dom/listeners?


getToken();
spotifyWindow();
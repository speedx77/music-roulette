var token2 = "";
var id = $("#randomize").attr("data-user")
var deviceIdToPost = "";
var device_id = "";
var randomPlaylistId = "";


var allTracksPlaylist = [];
var allTracksPlaylistInfo = [];

var currentVolume = 0;
var playingTrack = {};
var initialDuration = 0;
var durationOfTrackMinutes = 0;
var durationOfTrackSeconds = 0;
var durationOfTrack = "";
var colorArray = [];
var positionOfTrack = 0;
var positionMintues = 0;
var positionSeconds = 0;
var finalPosition = "";
var progress = 0;
var seekPosition = 0;

var playerReady = false;



//TO: DO
    //loop still broken for fully local playlists

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

async function spotifyWindow() {
    window.onSpotifyWebPlaybackSDKReady = () => {
        const token = 'BQDyk7e25I5FJaoU5UG_Ojq1EK6ru71-O2Iq5u2OnotRm6EeKMpEVPYWtMQyyJpYtoF026bM6qba9mHkAXUoK94mwPXx1FaEdwo6PFETlyJX10tMjbS9mgxCZ00-i20cTrzQUz2w6yBUwpvEzhJK_RTeIfIFWwBYGDtzlRSYcPIpoXKbnbfBUQwCzWooM8fmaUn7XEpGBwoeKFvaN4FGvgBA';
        console.log("test")

        const player = new Spotify.Player({
            name: 'Music Roulette',
            getOAuthToken: cb => { cb(token2); },
            volume: 0.25
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
        };

        document.getElementById('skip').onclick = function() {
            player.nextTrack();

        }

        document.getElementById("previous").onclick = function() {
            player.previousTrack();
        }

        

        document.getElementById("mute").onclick = function() {
            

            player.getVolume().then(volume => {
                
                console.log("vol: " +volume);
                console.log("current vol: "+currentVolume)
                if (volume != 0) {
                    currentVolume = volume;
                    player.setVolume(0);
                } 
                
                else if (volume === 0) {
                    player.setVolume(currentVolume);
                }
            })
        }

        player.addListener('player_state_changed', ({
            position,
            duration,
            track_window: { current_track }
          }) => {
            console.log('Currently Playing', current_track);
            console.log('Position in Song', position);
            console.log('Duration of Song', duration);
            //positionOfTrack = position
            playingTrack = current_track;
            initialDuration = duration;
            durationOfTrackMinutes = Math.floor((duration / 1000) / 60)
            durationOfTrackSeconds = Math.floor((duration / 1000) % 60)
            if (durationOfTrackSeconds < 10){
                durationOfTrackSeconds = "0"+durationOfTrackSeconds
            }
            durationOfTrack = durationOfTrackMinutes.toString() + ":" + durationOfTrackSeconds.toString()
            document.getElementById("duration").innerHTML = `${durationOfTrack}`

            //document.getElementById("position").innerHTML = `${positionOfTrack}`

            $("#art").css("background-image", "url('"+current_track.album.images[0].url+"')")
            colorjs.prominent(`${playingTrack.album.images[0].url}`, { amount: 3 }).then(color => {
                console.log(color) // [241, 221, 63]
                colorArray = color
            });
            changeBackgroundColor(colorArray);
            $("#trackName").html(`${current_track.name}`)
            $("#trackInfo").html(`${current_track.album.name} <span> - </span>${current_track.artists[0].name}<span></span>`)

            for (var track = 0; track < allTracksPlaylistInfo.length; track++) {

                if (current_track.name === allTracksPlaylistInfo[track].trackName) {
                    $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[track].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[track].playlistOwner}</span>`)
                }

            }


            setInterval(() => {
                player.getCurrentState().then(state => {
                    if (!state) {
                        console.error('User is not playing music through the Web Playback SDK');
                        return;
                      }
                    positionOfTrack = state.position;
    
                    if (positionOfTrack > 0) {
    
                        positionMintues = Math.floor((positionOfTrack / 1000) / 60)
                        positionSeconds = Math.floor((positionOfTrack / 1000) % 60)
    
                        if (positionSeconds < 10){
                            positionSeconds = "0"+positionSeconds
                        }
    
                        finalPosition = positionMintues.toString() + ":" + positionSeconds.toString();
    
                        $("#position").html(`${finalPosition}`)
                        
    
                    }
    
                    else {
                        $("#position").html("0:00")
    
                    }         
    
                    progress = (positionOfTrack / initialDuration) * 100;
                    $("#progress-input").attr("value", `${progress}`)

                })
            }, 1000)
        

          });



        //bug bar moves every 2 secs because width is 200px?
        document.getElementById("progress-input").oninput = function() {

                if (this.value != 0) {
                    seekPosition = (this.value / 100 ) * initialDuration
                    player.seek(seekPosition);

                    setInterval(() => {
                        document.getElementById("progress-input").value = progress
                    }, 1000)


                }

                else {
                    seekPosition = 0
                    player.seek(seekPosition);

                    setInterval(() => {
                        document.getElementById("progress-input").value = progress
                    }, 1000)

                }

        }

        player.connect();
    }
}

function imageFinder(response) {

    if(response.images){
        return(response.images[0].url)
    }
    else{
        return(response.album.images[0].url)
    }
    //else if return blank image?
}


function randomPlaylist (response) {
    var numOfPlaylists = response.total;
    var selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
    console.log("selected playlist: ", selectedPlaylist)
    
    var playlistFullyLocal = true;

    do {

        if (isPlaylistFullyLocal(response.items[selectedPlaylist].id) === true) {
            selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
            console.log("re-selected playlist: ", selectedPlaylist)
        } else {
           playlistFullyLocal = false
           console.log("playlist is not fully local")
        }

    } while (playlistFullyLocal === true)
    //function -> isPlaylistFullyLocal?
    console.log("playlist is good")
    return (response.items[selectedPlaylist].id)
}

async function isPlaylistFullyLocal(playlistId) {

    var fullyLocal = false;

    var start = 0;
    var end = 100;

    var response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${token2}`
        }
    }).then(response => response.json()).then(data=> {
        result = data
    });


    if(result.items.every(track => track.track.id === null)) {
        fullyLocal = true;
    } else {
        fullyLocal = false;
    }
    /*
    result.items.forEac((track) => {
        if(track.track.id === null){
            console.log("id of track: ", track.track.id)
            fullyLocal = true
        }
        else {
            fullyLocal = false
        }
    });
    */
    

    console.log("fullyLocal: ", fullyLocal)

    return(fullyLocal)

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
            var selectedTrack = (Math.floor(Math.random() * result.items.length));
            console.log("selected track: "+selectedTrack)
    
     
            do {
             console.log("result: "+ result.items[selectedTrack].track.id)
                if(result.items[selectedTrack].track.id != null) {
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
                        trackId : result.id,
                        trackName : result.name,
                        trackArt : imageFinder(result),
                        trackArtist : result.artists[0].name,
                        albumName : result.album.name,
                        playlistName: result2.name,
                        playlistOwner: result2.owner.display_name
                    })

                    trackSelected = true;
                }

                else {
                    selectedTrack = (Math.floor(Math.random() * result.items.length));
                    console.log("re-selected track: " + selectedTrack)
                }
            }
            while(trackSelected == false)
                
            playerReady = true;    
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
            var selectedTrack = (Math.floor(Math.random() * result.items.length));
            console.log("selected track: "+selectedTrack)
    
     
            do {
             console.log("result: "+ result.items[selectedTrack].track.id)
                if(result.items[selectedTrack].track.id !=null ) {
                    allTracksPlaylist.push(result.items[selectedTrack].track.id)
                    trackSelected = true;

                    response = await fetch("https://api.spotify.com/v1/tracks/"+result.items[selectedTrack].track.id+"", {
                        method: "GET",
                        headers: {
                            "Authorization" : `Bearer ${token2}`
                        }
                    }).then(response => response.json()).then(data => {
                        result = data
                    });
    
                    allTracksPlaylistInfo.push({
                        trackId : result.id,
                        trackName : result.name,
                        trackArt : imageFinder(result),
                        trackArtist : result.artists[0].name,
                        albumName : result.album.name,
                        playlistName: result2.name,
                        playlistOwner: result2.owner.display_name
                    })
                }

                else {
                    selectedTrack = (Math.floor(Math.random() * result.items.length));
                    console.log("re-selected track: " + selectedTrack)
                }

            }
            while(trackSelected == false)
     
             playerReady = true;
             return(allTracksPlaylist)

        }



    //}
    
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


function changeBackgroundColor(colorArray) {
    //    background: linear-gradient(180deg, rgba(58,109,140,1) 0%, rgba(234,216,177,1) 50%, rgba(198,158,188,1) 100%);

    $("body").css("background", `linear-gradient(180deg, rgba(${colorArray[0][0]},${colorArray[0][1]},${colorArray[0][2]},1), rgba(${colorArray[1][0]},${colorArray[1][1]},${colorArray[1][2]},1), rgba(${colorArray[2][0]},${colorArray[2][1]},${colorArray[2][2]},1))`)

    /*
    $("body").animate({
        "background-color": `linear-gradient(180deg, rgba(${colorArray[0][0]},${colorArray[0][1]},${colorArray[0][2]},1), rgba(${colorArray[1][0]},${colorArray[1][1]},${colorArray[1][2]},1), rgba(${colorArray[2][0]},${colorArray[2][1]},${colorArray[2][2]},1))`
    }, 2000)
    */

}

function playerBootup() {
    getToken();
    spotifyWindow();

    if (playerReady === true) {
        $("#loadingBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "block"})
    }

}

getToken();
spotifyWindow();
//playRandomTrackPlaylist(id)

console.log("working")

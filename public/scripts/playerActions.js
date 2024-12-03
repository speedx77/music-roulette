var token2 = "";
var id = $("#randomize").attr("data-user")
var deviceIdToPost = "";
var device_id = "";
var randomPlaylistId = "";


var allTracksPlaylist = [];
var allTracksPlaylistInfo = [];
var trackBodyPlaylist = {
    "uris" : []
};

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

var trackNameContainerWidth = 0;
var trackNameWidth = 0;
var artistNameContainerWidth = 0;
var artistNameWidth = 0;
var trackInfoContainerWidth = 0;
var trackInfoWidth = 0;
var playlistInfoContainerWidth = 0;
var playlistInfoWidth = 0;

var isFullyLocal = false;
var trackIndex = 0;
var linkedFromPresent = false;



//TO: DO
    //loop still broken for fully local playlists

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
            volume: 0.3
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
            resetTrackInfoScrolling();

        }

        document.getElementById("previous").onclick = function() {
            player.previousTrack();
            resetTrackInfoScrolling();
        }

        document.getElementById("raise-volume").onclick = function () {
            player.getVolume().then(volume => {
                console.log("vol: " +volume);
                console.log("current vol: "+currentVolume)
                
                if (volume === 1){
                    $("#volumeArea").html("<div class='d-flex align-items-center justify-content-center'>Volume Set to 100%</div>")
                    $("#volumeArea").fadeIn();
                    $("#volumeArea").fadeOut();
                }
                else {
                    player.setVolume(Math.round((volume + .1) * 100) / 100)
                    currentVolume = Math.round((volume + .1) * 100)
                    $("#volumeArea").html(`<div class='d-flex align-items-center justify-content-center'>Volume Set to ${currentVolume}%</div>`)
                    $("#volumeArea").fadeIn();
                    $("#volumeArea").fadeOut();
                }
            })
        }

        document.getElementById("lower-volume").onclick = function () {
            player.getVolume().then(volume => {
                console.log("vol: " +volume);
                console.log("current vol: "+currentVolume)

                if (volume === 0) {
                    $("#volumeArea").html("<div class='d-flex align-items-center justify-content-center'>Volume Set to 0%</div>")
                    $("#volumeArea").fadeIn();
                    $("#volumeArea").fadeOut();
                }

                else {
                    player.setVolume(Math.round((volume - .1) * 100) / 100)
                    currentVolume = Math.round((volume - .1) * 100)
                    $("#volumeArea").html(`<div class='d-flex align-items-center justify-content-center'>Volume Set to ${currentVolume}%</div>`)
                    $("#volumeArea").fadeIn();
                    $("#volumeArea").fadeOut();
                }
            })
        }

        

        document.getElementById("mute").onclick = function() {
            

            player.getVolume().then(volume => {
                
                console.log("vol: " +volume);
                console.log("current vol: "+currentVolume)
                if (volume != 0) {
                    currentVolume = volume;
                    player.setVolume(0);
                    $("#volumeArea").html("<div class='d-flex align-items-center justify-content-center'>Volume Set to 0%</div>")
                    $("#volumeArea").fadeIn();
                    $("#volumeArea").fadeOut();
                } 
                
                else if (volume === 0) {
                    player.setVolume(currentVolume);
                    $("#volumeArea").html(`<div class='d-flex align-items-center justify-content-center'>Volume Set to ${Math.round(currentVolume * 100)}%</div>`)
                    $("#volumeArea").fadeIn();
                    $("#volumeArea").fadeOut();
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
            $("#artistName").html(`${current_track.artists[0].name}`)
            $("#trackInfo").html(`${current_track.album.name} <span> - </span>${current_track.artists[0].name}<span></span>`)
            //$("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[0].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[0].playlistOwner}</span>`)

            playlistNameChange(current_track)
            /*
            linkedFromPresent = "linked_from.id" in current_track
            console.log("before linked_from: ", linkedFromPresent)
            if(linkedFromPresent === true) {
                console.log("if true linked_from: ", linkedFromPresent)
                console.log("trackIndex: ", allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id))
                $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistOwner}</span>`)
            } else if ( linkedFromPresent === false ) {
                console.log("if false linked_from: ", linkedFromPresent)
                console.log("trackIndex: ", allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id))
                $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistOwner}</span>`)
            }
            */
        
            /*
            for (var track = 0; track < allTracksPlaylistInfo.length; track++) {

                if ("linked_from.id" in current_track) {
                    console.log("linked from present");
                    console.log("current track id: ", current_track.id);
                    console.log("allplaylist track id: ", allTracksPlaylistInfo[track].trackId);
                    console.log("alltracksplaylistname: ", allTracksPlaylistInfo[track].playlistName);
                    if (current_track.linked_from.id === allTracksPlaylistInfo[track].trackId) {
                        $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[track].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[track].playlistOwner}</span>`)
                    } 
                }
                else if (current_track.id === allTracksPlaylistInfo[track].trackId) {
                    console.log("linked from not present");
                    console.log("current track id: ", current_track.id);
                    console.log("allplaylist track id: ", allTracksPlaylistInfo[track].trackId);
                    console.log("alltracksplaylistname: ", allTracksPlaylistInfo[track].playlistName);
                    $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[track].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[track].playlistOwner}</span>`)
                }

            }
            */




            trackInfoScrolling();

            if(position === 0) {
                resetTrackInfoScrolling();
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


async function randomPlaylist (response) {
    var numOfPlaylists = response.total;
    var selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
    console.log("selected playlist: ", selectedPlaylist)
    
    var playlistFullyLocal = true;


    do {

        isFullyLocal = await isPlaylistFullyLocal(response.items[selectedPlaylist].id);
        console.log("isFullyLocal: ", isFullyLocal);

        if (isFullyLocal === true) {
            selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
            console.log("re-selected playlist: ", selectedPlaylist)


        } else if (isFullyLocal === false) {
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
            randomPlaylistId = await randomPlaylist(result);
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
                
                var response = await fetch('https://api.spotify.com/v1/me/player/play?device_id=' + device_id, {
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

    $("body").css({
        "background": `linear-gradient(45deg, rgba(${colorArray[0][0]},${colorArray[0][1]},${colorArray[0][2]},1), rgba(${colorArray[1][0]},${colorArray[1][1]},${colorArray[1][2]},1), rgba(${colorArray[2][0]},${colorArray[2][1]},${colorArray[2][2]},1))`,
        "background-size" : "600% 600%",

        "-webkit-animation": "BackgroundAnimation 14s ease infinite",
        "-moz-animation": "BackgroundAnimation 14s ease infinite",
        "-o-animation": "BackgroundAnimation 14s ease infinite",
        "animation": "BackgroundAnimation 14s ease infinite"
    })

    /*
    $("body").animate({
        "background-color": `linear-gradient(180deg, rgba(${colorArray[0][0]},${colorArray[0][1]},${colorArray[0][2]},1), rgba(${colorArray[1][0]},${colorArray[1][1]},${colorArray[1][2]},1), rgba(${colorArray[2][0]},${colorArray[2][1]},${colorArray[2][2]},1))`
    }, 2000)
    */

}

async function revealSong(playerReadyState) {

    if (playerReadyState === true){
        $("#loadingBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "block"});
        $("#volumeArea").fadeOut();
    }
}

$("#randomize").click(() => {
    allTracksPlaylistInfo = [];
    playerReady = false;
    $("#songBlock").css({"display" : "none"});
    $("#loadingBlock").css({"display" : "block"});
    playerBootup(playerReady)

})

function trackInfoScrolling() {
    trackNameContainerWidth = $(".trackNameContainer").width();
    trackNameWidth = document.getElementById("trackName").scrollWidth;
    artistNameContainerWidth = $(".artistNameContainer").width();
    artistNameWidth = document.getElementById("artistName").scrollWidth;
    trackInfoContainerWidth = $(".trackInfoContainer").width();
    trackInfoWidth = document.getElementById("trackInfo").scrollWidth;
    playlistInfoContainerWidth = $(".playlistInfoContainer").width();
    playlistInfoWidth = document.getElementById("playlistInfo").scrollWidth;


    if (trackNameWidth > trackNameContainerWidth) {
        $("#trackName").addClass("trackNameAnimation")
    } else if (trackNameWidth <= trackNameContainerWidth) {{
        $("#trackName").removeClass("trackNameAnimation")
    }}

    if (artistNameWidth > artistNameContainerWidth) {
        $("#artistName").addClass("artistNameAnimation")
    } else if (artistNameWidth <= artistNameContainerWidth) {
        $("#artistName").removeClass("artistNameAnimation")
    }

    if (trackInfoWidth > trackInfoContainerWidth){
        $("#trackInfo").addClass("trackInfoAnimation")
    } else if (trackInfoWidth <= trackInfoContainerWidth) {
        $("#trackInfo").removeClass("trackInfoAnimation")
    }

    if (playlistInfoWidth > playlistInfoContainerWidth){
        $("#playlistInfo").addClass("playlistInfoAnimation")
    } else if (playlistInfoWidth <= playlistInfoContainerWidth) {
        $("#playlistInfo").removeClass("playlistInfoAnimation")
    }
}


function resetTrackInfoScrolling() {

    $("#trackName").removeClass("trackNameAnimation")
    $("#artistName").removeClass("artistNameAnimation")
    $("#trackInfo").removeClass("trackInfoAnimation")
    $("#playlistInfo").removeClass("playlistInfoAnimation")

}

function playlistNameChange(playing_track) {

    //linkedFromPresent = "id" in playing_track.linked_from;
    //swap playingTrack for playing_track
    if(playing_track.linked_from.id != null) {
        //console.log("if true linked_from: ", linkedFromPresent)
        //console.log("trackIndex: ", allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id))
        $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id)].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id)].playlistOwner}</span>`)
    } else if ( playing_track.linked_from.id === null ) {
        //console.log("if false linked_from: ", linkedFromPresent)
        //console.log("trackIndex: ", allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id))
        $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistOwner}</span>`)
    }
    
}

async function playerBootup() {
    await spotifyWindow();
    await getToken();
    await playRandomTrackPlaylist(id);
    await revealSong(playerReady);

}

//getToken();
//spotifyWindow();
//playRandomTrackPlaylist(id)

playerBootup();



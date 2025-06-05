var token2 = "";
var refreshToken = "";
var id = $("#randomize").attr("data-user")
var deviceIdToPost = "";
var device_id = "";
var player_device_id = "";
var randomPlaylistId = "";

var randomPlaylistId1 = "";
var randomPlaylistId2 = "";
var randomPlaylistId3 = "";
var randomPlaylistId4 = "";
var randomPlaylistId5 = "";
var randomPlaylistId6 = "";
var randomPlaylistId7 = "";
var randomPlaylistId8 = "";
var randomPlaylistId9 = "";
var randomPlaylistId10 = "";

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
var playlistNull = false;
var trackIndex = 0;
var linkedFromPresent = false;

var isThisSongSaved = false;

var profileShowing = false;
var infoShowing = false;

var currentUser = {};
var selectedUser = {};


async function getCurrentDeviceId() {
    const response = await fetch("https://api.spotify.com/v1/me/player/devices/", {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${at}`
        }
    }).then(response => response.json()).then(data => {
        for(var i = 0; i < data.devices.length; i++){
            if (data.devices[i].id === player_device_id){
                deviceIdToPost = data.devices[i].id;
                device_id = data.devices[i].id;
            }
        };
    })
    console.log("this is: ", deviceIdToPost);

    await fetch("/api/post/deviceId", {
        method: "POST",
        body: new URLSearchParams({
            "deviceId" : deviceIdToPost
        })
    });
}

async function spotifyWindow() {
    window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("test")

        const player = new Spotify.Player({
            name: 'Music Roulette',
            getOAuthToken: cb => { cb(at); },
            volume: 0.3
        });
    
        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            player_device_id = device_id;
            //testDevice(device_id);
            //postDeviceId(device_id);
            getCurrentDeviceId();
            
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
                    $("#volumeArea").html("<div>Volume Set to 100%</div>")
                    $("#volumeArea").animate({ opacity:1}, 1000);
                    $("#volumeArea").animate({ opacity:0}, 1000);
                }
                else {
                    player.setVolume(Math.round((volume + .1) * 100) / 100)
                    currentVolume = Math.round((volume + .1) * 100)
                    $("#volumeArea").html(`<div>Volume Set to ${currentVolume}%</div>`)
                    $("#volumeArea").animate({ opacity:1}, 1000);
                    $("#volumeArea").animate({ opacity:0}, 1000);
                }
            })
        }

        document.getElementById("lower-volume").onclick = function () {
            player.getVolume().then(volume => {
                console.log("vol: " +volume);
                console.log("current vol: "+currentVolume)

                if (volume === 0) {
                    $("#volumeArea").html("<div>Volume Set to 0%</div>")
                    $("#volumeArea").animate({ opacity:1}, 1000);
                    $("#volumeArea").animate({ opacity:0}, 1000);
                }

                else {
                    player.setVolume(Math.round((volume - .1) * 100) / 100)
                    currentVolume = Math.round((volume - .1) * 100)
                    $("#volumeArea").html(`<div>Volume Set to ${currentVolume}%</div>`)
                    $("#volumeArea").animate({ opacity:1}, 1000);
                    $("#volumeArea").animate({ opacity:0}, 1000);
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
                    $("#volumeArea").html("<div>Volume Set to 0%</div>")
                    $("#volumeArea").animate({ opacity:1}, 1000);
                    $("#volumeArea").animate({ opacity:0}, 1000);
                } 
                
                else if (volume === 0) {
                    player.setVolume(currentVolume);
                    $("#volumeArea").html(`<div>Volume Set to ${Math.round(currentVolume * 100)}%</div>`)
                    $("#volumeArea").animate({ opacity:1}, 1000);
                    $("#volumeArea").animate({ opacity:0}, 1000);
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

            $("#artPicture").attr("src", current_track.album.images[0].url)
            colorjs.prominent(`${playingTrack.album.images[0].url}`, { amount: 3 }).then(color => {
                console.log(color) // [241, 221, 63]
                var colorArray = color
                changeBackgroundColor(colorArray);
            });
            $("#trackName").html(`${current_track.name}`)
            $("#artistName").html(`${current_track.artists[0].name}`)
            $("#trackInfo").html(`${current_track.album.name} <span> - </span>${current_track.artists[0].name}<span></span>`)
            playlistNameChange(current_track);
            playlistLinkSet(current_track);
          
        
            isSongSaved(current_track);

            if (isThisSongSaved === true) {
                $("#save").css("background-image", "url('../assets/heart-saved.png')")

            } else if (isThisSongSaved === false) {
                $("#save").css("background-image", "url('../assets/heart.png')")

            }


            

            if(position === 0) {
                resetTrackInfoScrolling();
            }

            trackInfoScrolling();


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
    var numOfPlaylists = response.items.length;
    console.log(response)
    var selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
    console.log("selected playlist: ", selectedPlaylist)
    
    var playlistFullyLocal = true;


    do {

        playlistNull = await isPlaylistNull(response.items[selectedPlaylist])
        console.log("playlistNull: ", playlistNull)

        if (playlistNull === false) {

            isFullyLocal = await isPlaylistFullyLocal(response.items[selectedPlaylist].id);
            console.log("isFullyLocal: ", isFullyLocal);

            if (isFullyLocal === true) {
                selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
                console.log("re-selected playlist: ", selectedPlaylist)
    
    
            } else if (isFullyLocal === false) {
               playlistFullyLocal = false
               console.log("playlist is not fully local")
            }

        } else if (playlistNull === true) {
            selectedPlaylist = Math.floor(Math.random() * numOfPlaylists);
            console.log("re-selected playlist: ", selectedPlaylist)
        }
    

    } while (playlistFullyLocal === true)
    //function -> isPlaylistFullyLocal?
    console.log("playlist is good")
    return (response.items[selectedPlaylist].id)
}

async function isPlaylistNull(playlistid) {

    if(playlistid === null) {
        return true
    } else {
        return false
    }
}

async function isPlaylistFullyLocal(playlistId) {

    var fullyLocal = false;

    var start = 0;
    var end = 100;

    var response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${at}`
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
                "Authorization" : `Bearer ${at}`
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
                    "Authorization" : `Bearer ${at}`
                }
            }).then(response => response.json()).then(data=> {
                result2 = data
            })

            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + randomStart + "&limit=" + end, {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${at}`
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

                    response = await fetch("https://api.spotify.com/v1/tracks/"+result.items[selectedTrack].track.id+"?market="+currentUser.country+"", {
                        method: "GET",
                        headers: {
                            "Authorization" : `Bearer ${at}`
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
                        playlistOwner: result2.owner.display_name,
                        playlistId : playlistId
                    })

                    trackSelected = true;
                }

                else {
                    selectedTrack = (Math.floor(Math.random() * result.items.length));
                    console.log("re-selected track: " + selectedTrack)
                }
            }
            while(trackSelected == false)
                

        }
        else {

            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"?fields=name,owner(display_name)", {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${at}`
                }
            }).then(response => response.json()).then(data=> {
                result2 = data
            })


            response = await fetch("https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?offset=" + start + "&limit=" + end, {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${at}`
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

                    response = await fetch("https://api.spotify.com/v1/tracks/"+result.items[selectedTrack].track.id+"?market="+currentUser.country+"", {
                        method: "GET",
                        headers: {
                            "Authorization" : `Bearer ${at}`
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
                        playlistOwner: result2.owner.display_name,
                        playlistId : playlistId
                    })
                }

                else {
                    selectedTrack = (Math.floor(Math.random() * result.items.length));
                    console.log("re-selected track: " + selectedTrack)
                }

            }
            while(trackSelected == false)
     

        }



    //}
    //these were returned after the while loops previously
    //playerReady = true;
    return(allTracksPlaylist)


}

async function playRandomTrackPlaylist (userId) {

    const finalUserId = userId
    console.log(finalUserId)
    try {
        var result = {};
        var response = await fetch("https://api.spotify.com/v1/users/"+finalUserId+"/playlists", {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${at}`
            }
        }).then(response => response.json()).then(data=> {
            result = data;
        });

        /* original method of creating playlist
        for (var count = 0; count < 10; count++){ 
            randomPlaylistId = await randomPlaylist(result);
            //console.log("user/playlist: " + device_id)
            await createRandomPlaylist(randomPlaylistId)  
        }
        */

        await Promise.all([
            randomPlaylist(result).then(data => {randomPlaylistId1 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId2 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId3 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId4 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId5 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId6 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId7 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId8 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId9 = data}),
            randomPlaylist(result).then(data => {randomPlaylistId10 = data}),
        ])

        await Promise.all([
            await createRandomPlaylist(randomPlaylistId1),
            await createRandomPlaylist(randomPlaylistId2),
            await createRandomPlaylist(randomPlaylistId3),
            await createRandomPlaylist(randomPlaylistId4),
            await createRandomPlaylist(randomPlaylistId5),
            await createRandomPlaylist(randomPlaylistId6),
            await createRandomPlaylist(randomPlaylistId7),
            await createRandomPlaylist(randomPlaylistId8),
            await createRandomPlaylist(randomPlaylistId9),
            await createRandomPlaylist(randomPlaylistId10),

        ])

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
                      'Authorization': `Bearer ${at}`,
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

    console.log(colorArray);

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
        $("#profileBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "block"});
        $("#volumeArea").animate({ opacity:0}, 1000);
    }
}

$("#randomize").click(() => {
    allTracksPlaylistInfo = [];
    playerReady = false;
    $("#songBlock").css({"display" : "none"});
    $("#profileBlock").css({"display" : "none"});
    $("#loadingBlock").css({"display" : "flex"});
    playerBootup(playerReady)

})


function trackInfoScrolling() {
    trackNameContainerWidth = document.querySelector(".trackNameContainer").offsetWidth;
    trackNameWidth = document.getElementById("trackName").scrollWidth;
    artistNameContainerWidth = document.querySelector(".artistNameContainer").offsetWidth;
    artistNameWidth = document.getElementById("artistName").scrollWidth;
    trackInfoContainerWidth = document.querySelector(".trackInfoContainer").offsetWidth;
    trackInfoWidth = document.getElementById("trackInfo").scrollWidth;
    playlistInfoContainerWidth = document.querySelector(".playlistInfoContainer").offsetWidth;
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
        if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id) != (-1)) {
            $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id)].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id)].playlistOwner}</span>`)
            $("#playlistInfo").css({"display" : "block"})
        } else if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id) === (-1)) {
            $("#playlistInfo").css({"display" : "none"})
        }

    } else if ( playing_track.linked_from.id === null ) {
        //console.log("if false linked_from: ", linkedFromPresent)
        //console.log("trackIndex: ", allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id))
        if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id) != (-1)) {
            $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistOwner}</span>`)
            $("#playlistInfo").css({"display" : "block"})
        } else if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id) === (-1)) {
            $("#playlistInfo").css({"display" : "none"})
        }
    }
    
}

function playlistLinkSet(playing_track) {

    if(playing_track.linked_from.id != null) {
        console.log("playing_track.linked_from.id is not null")
        if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id) != (-1)) {
            $("#playlist").attr("href", `https://open.spotify.com/playlist/${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id)].playlistId}`)
            $("#playlist").css({"display" : "block"})
        } else if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.linked_from.id) === (-1)) {
            $("#playlist").attr("href", `https://open.spotify.com/track/${playing_track.id}`)
            $("#playlist").css({"display" : "block"})
        }

    } else if ( playing_track.linked_from.id === null ) {
        console.log("playing_track.linked_from.id is null")
        if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id) != (-1)) {
            $("#playlist").attr("href", `https://open.spotify.com/playlist/${allTracksPlaylistInfo[allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id)].playlistId}`)
            $("#playlist").css({"display" : "block"})
        } else if (allTracksPlaylistInfo.findIndex(track => track.trackId === playingTrack.id) === (-1)) {
            $("#playlist").attr("href", `https://open.spotify.com/track/${playing_track.id}`)
            $("#playlist").css({"display" : "block"})
        }
    }
}

async function isSongSaved(playing_track) {

    let trackId = "";

    if(playing_track.linked_from.id != null) {
        trackId = playing_track.linked_from.id
    } else if(playing_track.linked_from.id === null) {
        trackId = playing_track.id
    }

    try {
        var response = await fetch("https://api.spotify.com/v1/me/tracks/contains?ids=" +trackId, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${at}`
            }
    }).then(response => response.json()).then(data=> {
        isThisSongSaved =  data[0]
        //console.log(result)
        //console.log("this is: "+ deviceIdToPost)
    });


    } catch (error) {
        console.error(error)
    }
}

async function saveSong(playing_track) {

    let trackId = "";

    if(playing_track.linked_from.id != null) {
        trackId = playing_track.linked_from.id
    } else if(playing_track.linked_from.id === null) {
        trackId = playing_track.id
    }

    try {
        var response = await fetch("https://api.spotify.com/v1/me/tracks?ids=" + trackId, {
            method: "PUT",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${at}`
            },
            body: JSON.stringify({
                "ids" : [
                    "string"
                ]
            })
        });
    } catch (error) {
        console.error(error)
    }

}

async function unSaveSong(playing_track) {
    let trackId = "";

    if(playing_track.linked_from.id != null) {
        trackId = playing_track.linked_from.id
    } else if(playing_track.linked_from.id === null) {
        trackId = playing_track.id
    }

    try {
        var response = await fetch("https://api.spotify.com/v1/me/tracks?ids=" + trackId, {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${at}`
            },
            body: JSON.stringify({
                "ids" : [
                    "string"
                ]
            })
        });
    } catch (error) {
        console.error(error)
    }

}

$("#save").click(() => {

    if (isThisSongSaved === true) {
        unSaveSong(playingTrack)
        $("#save").css("background-image", "url('../assets/heart.png')")
        isSongSaved(playingTrack)
    } else if(isThisSongSaved === false) {
        saveSong(playingTrack)
        $("#save").css("background-image", "url('../assets/heart-saved.png')")
        isSongSaved(playingTrack)
    }

})

async function isPlayerReady() {
    if(allTracksPlaylistInfo.length === 10){
        playerReady = true;
    }
}

$("#profile").click(async() => {

    

    if (playerReady === false) {
        if (profileShowing != true) {
            await getCurrentUser();
            await getSelectedUser();
            $("#loadingBlock").css({"display" : "none"});
            $("#songBlock").css({"display" : "none"});
            $("#infoBlock").css({"display" : "none"});
            $("#profileBlock").css({"display" : "block"});
            profileShowing = true;
            infoShowing = false;
        } else{
            $("#profileBlock").css({"display" : "none"});
            $("#infoBlock").css({"display" : "none"});
            $("#loadingBlock").css({"display" : "flex"});
            $("#songBlock").css({"display" : "none"});
            profileShowing = false;
            infoShowing = false;
        }
    } else if (playerReady === true) {
        if (profileShowing != true) {
            await getCurrentUser();
            await getSelectedUser();
            $("#loadingBlock").css({"display" : "none"});
            $("#songBlock").css({"display" : "none"});
            $("#infoBlock").css({"display" : "none"});
            $("#profileBlock").css({"display" : "block"});
            profileShowing = true;
            infoShowing = false;
        } else{
            $("#profileBlock").css({"display" : "none"});
            $("#infoBlock").css({"display" : "none"});
            $("#loadingBlock").css({"display" : "none"});
            $("#songBlock").css({"display" : "block"});
            profileShowing = false;
            infoShowing = false;
        }
    }
})

$("#info").click(() => {

    if(playerReady === false) {
        if (infoShowing != true) {
        $("#loadingBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "none"});
        $("#profileBlock").css({"display" : "none"});
        $("#infoBlock").css({"display" : "block"});
        infoShowing = true;
        profileShowing = false;
    } else{
        $("#infoBlock").css({"display" : "none"});
        $("#profileBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "none"});
        $("#loadingBlock").css({"display" : "flex"});
        infoShowing = false;
        profileShowing = false;
    }
    } else if(playerReady === true) {
        if (infoShowing != true) {
            $("#songBlock").css({"display" : "none"});
            $("#loadingBlock").css({"display" : "none"});
            $("#profileBlock").css({"display" : "none"});
            $("#infoBlock").css({"display" : "block"});
            infoShowing = true;
            profileShowing = false;
        } else{
            $("#infoBlock").css({"display" : "none"});
            $("#profileBlock").css({"display" : "none"});
            $("#loadingBlock").css({"display" : "none"});
            $("#songBlock").css({"display" : "block"});
            infoShowing = false;
            profileShowing = false;
        }
    }
})


$(".back").click(() => {
    
    if(playerReady === false) {  
        $("#profileBlock").css({"display" : "none"});
        $("#infoBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "none"});
        $("#loadingBlock").css({"display" : "flex"});
        profileShowing = false;
        infoShowing = false; 
    } else if(playerReady === true) {  
        $("#profileBlock").css({"display" : "none"});
        $("#infoBlock").css({"display" : "none"});
        $("#loadingBlock").css({"display" : "none"});
        $("#songBlock").css({"display" : "block"});
        profileShowing = false;
        infoShowing = false;
    }
})

async function getCurrentUser() {

    const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${at}`
        }
    }).then(response => response.json()).then(data => {
        if (data.images.length === 0) {
            currentUser = {
                profileImage: "../assets/default-pfp.jpg",
                profileId : data.id,
                displayName : data.display_name,
                profileLink: "https://open.spotify.com/user/" + data.id,
                country: data.country
            }
        } else {
            currentUser = {
                profileImage: data.images[0].url,
                profileId : data.id,
                displayName : data.display_name,
                profileLink: "https://open.spotify.com/user/" + data.id,
                country: data.country
            }
        }
        
    });

    $("#currentUserPfp").css({"background-image" : `url('${currentUser.profileImage}')`});
    $("#currentUserDisplayName").html(currentUser.displayName);
}

async function getSelectedUser() {

    const response = await fetch("https://api.spotify.com/v1/users/" + id, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${at}`
        }
    }).then(response => response.json()).then(data => {
        if(data.images.length === 0){
            selectedUser = {
                profileImage : "../assets/default-pfp.jpg",
                profileId : data.id,
                displayName: data.display_name,
                profileLink: "https://open.spotify.com/user/" + data.id
            }
        } else {
            selectedUser = {
                profileImage : data.images[0].url,
                profileId : data.id,
                displayName: data.display_name,
                profileLink: "https://open.spotify.com/user/" + data.id
            }
        }
        
    })

    $("#selectedUserPfp").css({"background-image" : `url('${selectedUser.profileImage}')`});
    $("#selectedUserDisplayName").html(selectedUser.displayName);

}

$("#spotifyLink").click(() => {
    window.open(currentUser.profileLink, "_blank");
})

$("#selectedProfileLink").click(() => {
    window.open(selectedUser.profileLink, "_blank");
})

//code from playerJS

//TO: DO
    //rename file to playerSkin JS?

var now = new Date();
const timeOptions = {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit"
}

var time = now.toLocaleDateString("en-us", timeOptions).split(", ")[1].split(" ")[0]

//change time
$("#time").html(`${time}`)
setInterval(() => {
    now = new Date();
    time = now.toLocaleDateString("en-us", timeOptions).split(", ")[1].split(" ")[0]

    $("#time").html(`${time}`)

}, 60000)

//video for horizontal scroll https://www.youtube.com/watch?v=iLmBy-HKIAw
//console.log($(".trackNameContainer").css("width"));
//console.log($("#trackName b").css("width"));

//research how spotify handles this and match timings


$("form").submit(() => {
    $("#searchBlock").css("display" , "none");
    $("#loadingBlockSearch").css("display", "flex");
})

var at = ""
var rt = ""

async function getToken() {
    await fetch("/tokens").then(response => response.json()).then(data => {
        at = data.at
        rt = data.rt
    })
}

async function refreshAt(){
    const response = await fetch("/refresh", {
        method: "POST",
        headers: {
            "Content-Type" : 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            refresh_token : rt
        })
    }).then(response => response.json()).then(data => {
        console.log("refreshed: " , data.at);
        at = data.at
    })
}





async function beginPlay(){
    
    const play = $("#play");
    play.click();
    console.log("button has been clicked");
}

async function playerBootup() {
    await getToken();
    setInterval(refreshAt, 5 * 60 * 1000)
    await spotifyWindow();
    await getToken();
    await getCurrentUser();
    await getSelectedUser();
    await playRandomTrackPlaylist(id);
    await isPlayerReady()
    await revealSong(playerReady);
    await beginPlay();

}

playerBootup();



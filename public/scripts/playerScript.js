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
var playerReady = false;
var currentVolume = 0;
var initialDuration = 0;
var durationOfTrackMinutes = 0;
var durationOfTrackSeconds = 0;
var durationOfTrack = "";
var positionOfTrack = 0;
var positionMintues = 0;
var positionSeconds = 0;
var finalPosition = "";
var progress = 0;
var seekPositionMinutes = 0;
var seekPositionSeconds = 0;
var seekPosition = 0;
var playingTrack = {};
var upNext = [];
var hideArray = [];
var found = false;
var queue = [];
var colorArray = [];


var position = 0;
var songsInQueue = []

//TO: DO
    //loop still broken for fully local playlists

window.addEventListener("load", function(event) {
    for (var i = 0; i < this.document.getElementsByClassName("up-next").length; i++) {
        songsInQueue.push(this.document.getElementsByClassName("up-next")[i])
    }
})
    

var songsToHide = []; //lessThan
var songsToDisplay = []; //greaterThan

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
          playPauseImgToggle();
        };

        document.getElementById('skip').onclick = function() {
            player.nextTrack();

           //document.getElementsByClassName("up-next")[8].style.display = 'none';

        }

        //select song in queue test code
        /*
        var upNextButtons = $(".up-next")
        for (var i = 0; i < upNextButtons.length; i++){
            upNextButtons[i].click(function() {
                var trackSelected = upNextButtons[i].attr("data-trackId")

                //trackBodyPlaylist.uris.push

                //await createRandomPlaylist(randomPlaylistId)
                /*
                for (var track = 0; track < 10; track++) {
                    trackBodyPlaylist.uris.push("\"spotify:track:"+allTracksPlaylist[track]+"\"")
                };
                allTracksPlaylist = [];
                //console.log("playlist id: " + randomPlaylistId);
                console.log(trackBodyPlaylist);
                

                try {
                    
                    var response = fetch('https://api.spotify.com/v1/me/player/play?device_id=' + device_id, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token2}`,
                          'Content-Type': 'text/plain'
                        },
                        body: `{\n  "uris": [${trackSelected}]\n}`
                      });
    
    
                } catch (error) {
                    console.error(error);
                }
            })
        }
        */


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
                    document.getElementById("mute").style.backgroundImage = "url('http://localhost:3001/assets/mute.png')"
                } 
                
                else if (volume === 0) {
                    player.setVolume(currentVolume);
                    document.getElementById("mute").style.backgroundImage = "url('http://localhost:3001/assets/volume.png')"
                }
            })
        }

        document.getElementById("volumeSlider").oninput = function() {
            if (this.value === 0) {
                player.setVolume(0)
            }
            else {
                player.setVolume(this.value / 100)
            }
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


            //upNext = document.getElementsByClassName("up-next");
            changeQueue();
            
            //use next and previous tracks to build upcoming songs
            //display next tracks only
            //refresh upcoming songs container when next tracks changes

            //function that makes this api query and displays elements
            //get users queue -  https://api.spotify.com/v1/me/player/queue
            //display elements of queue (refresh this when current_track changes?)
            //refresh on track change
            //refresh on next/ previous
            //refresh when users clicks on those div items
            //if duration of song changes refresh those div items
            
            
            //var hideArray = [];
            //var found = false;

            /*
            for(var track = 1; track < upNext.length; track++) {

                if (current_track.album.images[0].url === allTracksPlaylistInfo[track].trackArt) {
                    
                    found = true;
                    break;
                }

                hideArray.push(upNext[track])
            }
            
            for(const item of hideArray) {
                hideArray[item].style.display = "none";
            }
            
            */
        

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

// https://stackoverflow.com/questions/50180108/how-to-properly-track-playback-position-android-media-broadcast-notifications
// seek timestap every 100ms (1sec)
// update bar, draggable bar

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
    //else if return blank image?
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
            playerReady = true;
            if (playerReady) {

                /*
                $("#art").css("background-image", "url('"+allTracksPlaylistInfo[0].trackArt+"')")
                $("#trackName").html(`${allTracksPlaylistInfo[0].trackName}`)
                $("#trackInfo").html(`${allTracksPlaylistInfo[0].albumName} <span> - </span>${allTracksPlaylistInfo[0].trackArtist}<span></span>`)
                $("#playlistInfo").html(`Found on <span> <em>${allTracksPlaylistInfo[0].playlistName}</em> </span> - <span>${allTracksPlaylistInfo[0].playlistOwner}</span>`)
                */

                $("#next-1").css("background-image", "url('"+allTracksPlaylistInfo[1].trackArt+"')");
                $("#next-1").attr("data-trackId", `${allTracksPlaylistInfo[1].trackId}`);

                $("#next-2").css("background-image", "url('"+allTracksPlaylistInfo[2].trackArt+"')");
                $("#next-2").attr("data-trackId", `${allTracksPlaylistInfo[2].trackId}`);
                
                $("#next-3").css("background-image", "url('"+allTracksPlaylistInfo[3].trackArt+"')");
                $("#next-3").attr("data-trackId", `${allTracksPlaylistInfo[3].trackId}`);

                $("#next-4").css("background-image", "url('"+allTracksPlaylistInfo[4].trackArt+"')");
                $("#next-4").attr("data-trackId", `${allTracksPlaylistInfo[4].trackId}`);

                $("#next-5").css("background-image", "url('"+allTracksPlaylistInfo[5].trackArt+"')");
                $("#next-5").attr("data-trackId", `${allTracksPlaylistInfo[5].trackId}`);

                $("#next-6").css("background-image", "url('"+allTracksPlaylistInfo[6].trackArt+"')");
                $("#next-6").attr("data-trackId", `${allTracksPlaylistInfo[6].trackId}`);

                $("#next-7").css("background-image", "url('"+allTracksPlaylistInfo[7].trackArt+"')");
                $("#next-7").attr("data-trackId", `${allTracksPlaylistInfo[7].trackId}`);

                $("#next-8").css("background-image", "url('"+allTracksPlaylistInfo[8].trackArt+"')");
                $("#next-8").attr("data-trackId", `${allTracksPlaylistInfo[8].trackId}`);

                $("#next-9").css("background-image", "url('"+allTracksPlaylistInfo[9].trackArt+"')");
                $("#next-9").attr("data-trackId", `${allTracksPlaylistInfo[9].trackId}`);


                $("#loading").hide();
                $("#player").slideDown();
                $("#next-up").show();
            }
            
        

        

    } catch (error) {
        console.error(error)
    }
}

async function randomTrack (playlistId) {
    var start = 0;
    var end = 100;
    
    var result = {};
    var response = await fetch("https://api.spotify.com/v1/playlists/2ojKk8cuc4lTxuYPHyDauo/tracks?offset=" + start + "&limit=" + end, {
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
        response = await fetch("https://api.spotify.com/v1/playlists/2ojKk8cuc4lTxuYPHyDauo/tracks?offset=" + randomStart + "&limit=" + end, {
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
                allTracks.push(result.items[selectedTrack].track.id)
                trackSelected = true;
            }
            else {
                selectedTrack = (Math.floor(Math.random() * result.items.length))
                console.log("re-selected track: "+ selectedTrack)
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
        response = await fetch("https://api.spotify.com/v1/playlists/2ojKk8cuc4lTxuYPHyDauo/tracks?offset=" + start + "&limit=" + end, {
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

        /*

       var playlistNotAllLocal = false;

       do {



       } while(playlistNotAllLocal === false)


        result.items.forEach((track) => {
            if(track.track.id === null) {
                
            }
        })

        */


        var trackSelected = false;
        var selectedTrack = (Math.floor(Math.random() * result.items.length));
        console.log("selected track: "+selectedTrack)

 
        do {
         console.log("result: "+ result.items[selectedTrack].track.id)
            if(result.items[selectedTrack].track.id != null) {
                allTracks.push(result.items[selectedTrack].track.id)
                trackSelected = true;
            }
            else {
                selectedTrack = (Math.floor(Math.random() * result.items.length))
                console.log("re-selected track: "+ selectedTrack)
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

async function updateQueue () {

    try {
        
        var result = {}
        var response = await fetch("https://api.spotify.com/v1/me/player/queue", {
            method: "GET",
            headers: {
                'Authorization' : `Bearer ${token2}`,
            }
        }).then(response => response.json()).then(data => {
            result = data;
        })

        console.log("Queue: ", result);

        for(var track = 0; track < result.queue.length; track++){

            queue.push({
                trackName: result.queue[track].name,
                trackArt: result.queue[track].album.images[0].url,
                trackArtist: result.queue[track].artists[0].name,
                albumName: result.queue[track].album.name,
                trackId: result.queue[track].id
                }
            )

            $("#next-1").css("background-image", "url('"+queue[0].trackArt+"')")
            $("#next-2").css("background-image", "url('"+queue[1].trackArt+"')")
            $("#next-3").css("background-image", "url('"+queue[2].trackArt+"')")
            $("#next-4").css("background-image", "url('"+queue[3].trackArt+"')")
            $("#next-5").css("background-image", "url('"+queue[4].trackArt+"')")
            $("#next-6").css("background-image", "url('"+queue[5].trackArt+"')")
            $("#next-7").css("background-image", "url('"+queue[6].trackArt+"')")
            $("#next-8").css("background-image", "url('"+queue[7].trackArt+"')")
            $("#next-9").css("background-image", "url('"+queue[8].trackArt+"')")

        }




    } catch (error) {
        console.error(error)
    }

    
}

function findPositionInQueue() {
    console.log("finding position in queue")
    console.log("position: " + allTracksPlaylistInfo.findIndex(obj => Object.values(obj).includes(playingTrack.id)))

    if(allTracksPlaylistInfo.findIndex(obj => Object.values(obj).includes(playingTrack.id)) === -1) {
        return (allTracksPlaylistInfo.findIndex(obj => Object.values(obj).includes(playingTrack.linked_from.id)))
    } else {
        return (allTracksPlaylistInfo.findIndex(obj => Object.values(obj).includes(playingTrack.id)))
    }

}

function changeQueue() {
    

    //for every element before this position in alltracksplaylistInfo, change display to none
    //if (position > 0) {

        /*
        for (var i = 0; i < position; i++){
            songsToHide.push(songsInQueue[i])
    
            for (var j in songsToHide){
                songsToHide[j].style.display = 'none';
            }
        }

        for (var i=0; i > position; i++){
            songsToDisplay.push(songsInQueue[i])

            for (var j in songsToDisplay) {
                songsToDisplay[j].style.display = 'block';
            }
        }

        songsToHide = [];
        songsToDisplay = [];
        */
        position = findPositionInQueue()
        /*
        if (position > 0) {
            for (var i = 0; i < songsInQueue.length; i++) {
                if (i != position) {
                    if (i < position) {
                        //console.log("songs to be hidden: ", songsInQueue[i])
                        songsToHide.push(songsInQueue[i]);
                    } else if ( i > position) {
                        //console.log("songs to be displayed: ", songsInQueue[i])
                        songsToDisplay.push(songsInQueue[i]);
                    }
                }
            }
        } 

         if (position === 0) {
            songsInQueue.forEach((element) => {
                songsToDisplay.push(element);
            })
        } else
        */

        /*
        change to a switch
        */
        if (position === 0) {

            songsInQueue[0].style.display = 'block';
            songsInQueue[1].style.display = 'block';
            songsInQueue[2].style.display = 'block';
            songsInQueue[3].style.display = 'block';
            songsInQueue[4].style.display = 'block';
            songsInQueue[5].style.display = 'block';
            songsInQueue[6].style.display = 'block';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';

            /*
            songsToDisplay.push(songsInQueue[1])
            songsToDisplay.push(songsInQueue[2])
            songsToDisplay.push(songsInQueue[3])
            songsToDisplay.push(songsInQueue[4])
            songsToDisplay.push(songsInQueue[5])
            songsToDisplay.push(songsInQueue[6])
            songsToDisplay.push(songsInQueue[7])
            songsToDisplay.push(songsInQueue[8])
            songsToDisplay.push(songsInQueue[9])

            console.log("songsToHide: ", songsToHide);
            console.log("songsToDisplay: ", songsToDisplay)
            */

            //songsToHide = [];
            //songsToDisplay = [];

        } else if (position === 1) {

            //songsToHide.push(songsInQueue[0])
            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = "block";
            songsInQueue[2].style.display = 'block';
            songsInQueue[3].style.display = 'block';
            songsInQueue[4].style.display = 'block';
            songsInQueue[5].style.display = 'block';
            songsInQueue[6].style.display = 'block';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';

            /*
            songsToDisplay.push(songsInQueue[2])
            songsToDisplay.push(songsInQueue[3])
            songsToDisplay.push(songsInQueue[4])
            songsToDisplay.push(songsInQueue[5])
            songsToDisplay.push(songsInQueue[6])
            songsToDisplay.push(songsInQueue[7])
            songsToDisplay.push(songsInQueue[8])
            songsToDisplay.push(songsInQueue[9])
            */
            //console.log("songsToHide: ", songsToHide);
            //console.log("songsToDisplay: ", songsToDisplay)

            /*
            if(songsToHide) {

                songsToHide.forEach((element) => {
                    element.style.display = 'none';
                });
    
            }
    
            if (songsToDisplay) {
                songsToDisplay.forEach((element) => {
                    element.style.display = 'block';
                });
            }
            */

            /*
            songsToHide = [];
            songsToDisplay = [];
            */

            /*
            for (var i = 2; i < 10; i++) {
                songsToDisplay.push(songsInQueue[i])

            }
            */
        } else if (position === 2) {

            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'block';
            songsInQueue[3].style.display = 'block';
            songsInQueue[4].style.display = 'block';
            songsInQueue[5].style.display = 'block';
            songsInQueue[6].style.display = 'block';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';


            //console.log("songsToHide: ", songsToHide);
            //console.log("songsToDisplay: ", songsToDisplay)

        
            //songsToHide = [];
            //songsToDisplay = [];

        } else if (position === 3) {

            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'none';
            songsInQueue[3].style.display = "block"
            songsInQueue[4].style.display = 'block';
            songsInQueue[5].style.display = 'block';
            songsInQueue[6].style.display = 'block';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';


            //console.log("songsToHide: ", songsToHide);
            //console.log("songsToDisplay: ", songsToDisplay)

        
            //songsToHide = [];
            //songsToDisplay = [];

        } else if (position === 4) {
        songsInQueue[0].style.display = 'none';
        songsInQueue[1].style.display = 'none';
        songsInQueue[2].style.display = 'none';
        songsInQueue[3].style.display = "none";
        songsInQueue[4].style.display = 'block';
        songsInQueue[5].style.display = 'block';
        songsInQueue[6].style.display = 'block';
        songsInQueue[7].style.display = 'block';
        songsInQueue[8].style.display = 'block';
        } else if (position === 5) {
            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'none';
            songsInQueue[3].style.display = "none";
            songsInQueue[4].style.display = 'none';
            songsInQueue[5].style.display = 'block';
            songsInQueue[6].style.display = 'block';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';
        } else if (position === 6) {
            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'none';
            songsInQueue[3].style.display = "none";
            songsInQueue[4].style.display = 'none';
            songsInQueue[5].style.display = 'none';
            songsInQueue[6].style.display = 'block';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';
        } else if (position === 7) {
            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'none';
            songsInQueue[3].style.display = "none";
            songsInQueue[4].style.display = 'none';
            songsInQueue[5].style.display = 'none';
            songsInQueue[6].style.display = 'none';
            songsInQueue[7].style.display = 'block';
            songsInQueue[8].style.display = 'block';
        } else if (position === 8) {
            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'none';
            songsInQueue[3].style.display = "none";
            songsInQueue[4].style.display = 'none';
            songsInQueue[5].style.display = 'none';
            songsInQueue[6].style.display = 'none';
            songsInQueue[7].style.display = 'none';
            songsInQueue[8].style.display = 'block';
        } else if (position === 9) {
            songsInQueue[0].style.display = 'none';
            songsInQueue[1].style.display = 'none';
            songsInQueue[2].style.display = 'none';
            songsInQueue[3].style.display = "none";
            songsInQueue[4].style.display = 'none';
            songsInQueue[5].style.display = 'none';
            songsInQueue[6].style.display = 'none';
            songsInQueue[7].style.display = 'none';
            songsInQueue[8].style.display = 'none';
        }

        

        

        /*
        for (var j in songsToHide) {
            //console.log("hidden songs: ", songsToHide[j])
            songsToHide[j].style.display = 'none';
        }

        for (var k in songsToDisplay) {
            //console.log("displayed songs: ", songsToDisplay[k])
            songsToDisplay[k].style.display = 'block';
        }
        


        /*
        console.log("songs to hide: ", songsToHide);
        console.log("songs to display: ", songsToDisplay);

        if(songsToHide) {

            songsToHide.forEach((element) => {
                element.style.display = 'none';
            });

        }

        if (songsToDisplay) {
            songsToDisplay.forEach((element) => {
                element.style.display = 'block';
            });
        }






        songsToHide = [];
        songsToDisplay = [];

        console.log("songs to hide reset: ", songsToHide);
        console.log("songs to display reset: ", songsToDisplay);
        */

    /*
    } else {
        return(null);
    }
    */
}

//add visibile: hidden style to these divs on player.ejs
$(document).ready(function() {
    $("#player").hide();
    $("#next-up").hide();
    $("#loading").hide();
})

$("#begin").click(function() {
    const id = document.getElementById('begin').getAttribute('data-user');
    playRandomTrackPlaylist(id);
    $("#loading").show();

    
    $("#toHide").hide();
})


$("#randomize").click(function() {
    allTracksPlaylistInfo = [];
    const id = document.getElementById('begin').getAttribute('data-user');
    playRandomTrackPlaylist(id);

    $("#player").slideUp();
    $("#next-up").slideUp();

    $("#loading").show();

   

})

function changeBackgroundColor(colorArray) {
    //    background: linear-gradient(180deg, rgba(58,109,140,1) 0%, rgba(234,216,177,1) 50%, rgba(198,158,188,1) 100%);

    $("body").css("background", `linear-gradient(180deg, rgba(${colorArray[0][0]},${colorArray[0][1]},${colorArray[0][2]},1), rgba(${colorArray[1][0]},${colorArray[1][1]},${colorArray[1][2]},1), rgba(${colorArray[2][0]},${colorArray[2][1]},${colorArray[2][2]},1))`)

    /*
    $("body").animate({
        "background-color": `linear-gradient(180deg, rgba(${colorArray[0][0]},${colorArray[0][1]},${colorArray[0][2]},1), rgba(${colorArray[1][0]},${colorArray[1][1]},${colorArray[1][2]},1), rgba(${colorArray[2][0]},${colorArray[2][1]},${colorArray[2][2]},1))`
    }, 2000)
    */

}


//update song images with dom/listeners?


getToken();
spotifyWindow();


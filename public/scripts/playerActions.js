var token2 = "";
var deviceIdToPost = "";
var device_id = "";


var songsInQueue = []

const playPauseButton = document.getElementById("play")




//TO: DO
    //loop still broken for fully local playlists

window.addEventListener("load", function(event) {
    for (var i = 0; i < this.document.getElementsByClassName("up-next").length; i++) {
        songsInQueue.push(this.document.getElementsByClassName("up-next")[i])
    }
})

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

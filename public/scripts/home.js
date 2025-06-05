const durationOfSong = 339 //in seconds
var trackTimer;

function revealUserSearch(){
    $("#loadingBlockSearch").css("display", "none")
    $("#searchBlock").css("display", "flex")
}

function revealSongLoad(){
    $("#searchBlock").css("display", "none")
    $("#loadingBlock").css("display", "flex")
}

function revealSong(){
    $("#loadingBlock").css("display", "none")
    $("#songBlock").css("display", "block")
}

setTimeout(revealUserSearch, 3000)
setTimeout(revealSongLoad, 6000)
setTimeout(() => {
    startTimer()
    revealSong()
}, 9000)


function startTimer(){
    var seconds = 0
    var positionMinutes;
    var positionSeconds;
    trackTimer = setInterval(() =>{
        seconds++
        //console.log("Seconds", seconds)

        var progress = (seconds / durationOfSong) * 100
        $("#progress-input").attr("value", progress)

        positionMinutes = Math.floor(seconds / 60);
        positionSeconds = Math.floor(seconds % 60);

        if(positionSeconds < 10){
            positionSeconds = '0'+positionSeconds;
        };

        //console.log(positionMinutes + ':' + positionSeconds)

        $("#position").html(positionMinutes + ':' + positionSeconds)
    }, 1000)
}

function stopTimer(){
    clearInterval(trackTimer)
    //console.log("timer stopped")
};

setInterval(() => {
    stopTimer();
    //console.log("timer restarted")
    startTimer();
}, durationOfSong * 1000)

//img scroll homepage
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

trackInfoScrolling();

const albumArt = [
    "../assets/paper-kites.jpg",
    "../assets/grouper.jpg",
    "../assets/lush.jpg",
    "../assets/lumineers.jpg",
    "../assets/reflections.jpg",
    "../assets/babel.jpg",
    "../assets/darling.jpg",
    "../assets/state-lines.jpg",
    "../assets/guard-dog.jpeg",
    '../assets/stranger-in-the-alps.png',
    '../assets/the-fray.jpg',
    '../assets/the-fray-2.jpg',
    '../assets/sonder-son.jpeg',
]


const scrollers = document.querySelectorAll(".scroller");

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addAnimation();
};

function addAnimation(){
    scrollers.forEach(scroller => {
        scroller.setAttribute("data-animated", true)
        
        const scrollerInner = scroller.querySelector(".scroller-inner");
        const scrollerContent = Array.from(scrollerInner.children);
    
        scrollerContent.forEach(item => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute('aria-hidden', true)

            scrollerInner.appendChild(duplicatedItem);
        })
    }

)
}

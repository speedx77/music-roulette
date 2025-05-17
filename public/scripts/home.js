const durationOfSong = 339 //in seconds
var trackTimer;

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

startTimer();

setInterval(() => {
    stopTimer();
    //console.log("timer restarted")
    startTimer();
}, durationOfSong * 1000)

//img scroll homepage

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

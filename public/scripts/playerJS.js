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

var trackNameContainerWidth = $(".trackNameContainer").width();
var trackNameWidth = $("#trackName b").outerWidth();
var artistNameContainerWidth = $(".artistNameContainer").width();
var artistNameWidth = $("#artistName b").outerWidth();
var trackInfoContainerWidth = $(".trackInfoContainer").width();
var trackInfoWidth = $("#trackInfo b").outerWidth();
var playlistInfoContainerWidth = $(".playlistInfoContainer").width();
var playlistInfoWidth = $("#playlistInfo b").outerWidth();


if (trackNameWidth > trackNameContainerWidth) {
    $("#trackName").addClass("trackNameAnimation")
}

if (artistNameWidth > artistNameContainerWidth) {
    $("#artistName").addClass("artistNameAnimation")
}

if (trackInfoWidth > trackInfoContainerWidth){
    $("#trackInfo").addClass("trackInfoAnimation")
}

if (playlistInfoWidth > playlistInfoContainerWidth){
    $("#playlistInfo").addClass("playlistInfoAnimation")
}

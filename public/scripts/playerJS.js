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

getToken();
setInterval(refreshAt, 5 * 60 * 1000)

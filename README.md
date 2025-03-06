---- Music Roulette ---

Explanation
Detailed README For public repo


-----Problems-------

1. pass Auth token on every page?
4. when changing to first song you can see a flash off phoebe bridgers placeholder

9. better background gradient
  9a https://codepen.io/P1N2O/pen/pyBNzX
  9b somewhat current one https://animated-gradient-background-generator.netlify.app/
  10c end goal? https://www.youtube.com/watch?v=Ml-B-W91gtw

10. style for font loads slow


12. top bar for instructions


14. loading screen pulse text?

15. multiple at tokens when going to player screen

16. multiple tabs debug, see if any issues?

17. got a null id error in song pull


post mvp
--------
  5. other mp3 player skins
  6. EE for replay song
  7. perhaps have search be a native function on player page instead of redirect

  8. profile upvotes
    for when we figure out the db stuff
    display +1 or +Hearts next to profile image to indicate that this profile is well liked


  9. in queue
      click on album or button
        animation pull back/small the album art and display all ten art on screen.
          if user clicks on playing song it takes them back to default songArea
            if user clicks on in queue song it takes them to that song in queue
    or swipe up on songInfo Area to reveal next song in queue?

    add more songs at the end of song 10?

  10. Random user if you don't want to search


  --------DONE-----


13. multiple tabs?
    if user randomizes from other tab it plays on the original tab but doesn't update url bar with the user id

    plays in intial tab because the device id is the first one in https://api.spotify.com/v1/me/player/devices/ maybe?, experiment with pulling the latest instance of Music Roulette in that response

7. fix song info animations - good for now

-----other backgrounds---

retro infinite:
place this below player div
<div class="wrap">
    
    <div class="top-plane"></div>
    <div class="bottom-plane"></div>
    
</div>

and this in mainRoulette.css

 html {
	 height: 100%;
	 overflow: hidden;
}
 body {
	 position: relative;
	 height: 100%;
	 background: linear-gradient(#6084d7 25%, #a2cef4 50%, #a2cef4 50%, #6084d7 100%);
}
 .wrap {
	 width: 100%;
	 height: 100%;
	 position: absolute;
	 margin: 0 auto;
	 perspective: 360px;
	 perspective-origin: 50% 50%;
}
 .top-plane, .bottom-plane {
	 width: 200%;
	 height: 130%;
	 position: absolute;
	 bottom: -30%;
	 left: -50%;
	 background-image: -webkit-linear-gradient(#a2cef4 2px, transparent 2px), -webkit-linear-gradient(left, #a2cef4 2px, transparent 2px);
	 background-size: 100px 100px, 100px 100px;
	 background-position: -1px -1px, -1px -1px;
	 transform: rotateX(85deg);
	 animation: planeMoveTop 2s infinite linear;
}
 .bottom-plane {
	 transform: rotateX(-85deg);
	 top: -30%;
	 animation: planeMoveBot 2s infinite linear;
}
 @keyframes planeMoveTop {
	 from {
		 background-position: 0px -100px, 0px 0px;
	}
	 to {
		 background-position: 0px 0px, 100px 0px;
	}
}
 @keyframes planeMoveBot {
	 from {
		 background-position: 0px 0px, 0px 0px;
	}
	 to {
		 background-position: 0px -100px, 100px 0px;
	}
}
 @media (max-height: 350px) {
	 .wrap {
		 perspective: 210px;
	}
}
 
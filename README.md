1. pass Auth token on every page?
4. when changing to first song you can see a flash off phoebe bridgers placeholder
7. fix song info animations - good for now
9. better background gradient
  9a https://codepen.io/P1N2O/pen/pyBNzX
  9b somewhat current one https://animated-gradient-background-generator.netlify.app/
  10c end goal? https://www.youtube.com/watch?v=Ml-B-W91gtw

10. style for font loads slow


12. top bar for instructions

13. multiple tabs?
    if user randomizes from other tab it plays on the original tab but doesn't update url bar with the user id

    plays in intial tab because the device id is the first one in https://api.spotify.com/v1/me/player/devices/ maybe?, experiment with pulling the latest instance of Music Roulette in that response

14. loading screen pulse text?

15. sign out button? via profile screen?

16. align the homepage button and gif?

17. consider changing "Link to Spotify" to Spotify Profile or Link to Spotify Profile






post mvp
--------
1. log out?
2. link to user and link to playlist
3. don't have multiple tabs of roulette open or there are too music roulettes in the devices response
    {
      "id": "244d0df069918f97df10cd41f1a26a323c744f96",
      "is_active": true,
      "is_private_session": false,
      "is_restricted": false,
      "name": "Music Roulette",
      "supports_volume": true,
      "type": "Computer",
      "volume_percent": 29
    },
    {
      "id": "a8bcf58d1658066d510c6071667153abbc001615",
      "is_active": false,
      "is_private_session": false,
      "is_restricted": false,
      "name": "Music Roulette",
      "supports_volume": true,
      "type": "Computer",
      "volume_percent": 29
    },

  4. improve speed of background color change? speed of liked song change?
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
8. vol pop up - DONE
7a. fix playlist name pull - DONE
2. home button on player -> takes user to search -DONE
5. solve fully local issue - DONE
17. save song
11. save and playlist button functionality
16. if playlist name cannot be found at all display:none to hide that line of copy


------Tracked Changes--------
# vr-browser-chess

This application lets you play chess in VR in the browser. 
Either choose the Multiplayer mode against another real person or the
single-player action against an AI. 

<ins>Disclaimer:</ins> This app only works with WebXR API
supported browsers, most notably: **Google Chrome** and **Samsung Internet**.

## Installation
Clone this GitHub repository with your preferred download method:  
**HTTPS**: `https://github.com/timkoeppel/vr-browser-chess.git`  
**SSH**:   `git@github.com:timkoeppel/vr-browser-chess.git`

Make sure you have *Node.js* and its packet manager *npm* installed
on your machine and install all required packages in this directory
with:  
`npm install`

For successfully deploying the server you have to provide SSL certificates 
in the root folder, a `cert.pem` and a `key.pem` to be specific.

## Get Started
To run the server and compile all required files just run:  
`npm run start`

If the server indicates it is listening on the defined port
(default `8443`), head over to the internet settings of your server
running machine and obtain the IP address.

With this set every device in this private network now can access
the vr-browser-chess by heading to the browser and go to:  
`https://xxx.xxx.xxx.xxx:8443`  
where the `x`s are indicating the formerly obtained IP address.

Go ahead, put your smartphone in your HMD and enjoy a round of classic
chess in the virtual world.

## Game
### Controller
Operating the game after it has loaded into your browser succeeds
via the **gaze pointer** in the middle of your screen or with 
**voice commands** indicating the chess fields you want to choose.  
Both controllers work by first telling the chess game which figure you want to select,
by moving to the desired field or mentioning its chess notation name. And secondly 
by indicating the field, you want the figure to go, in the same manner

### Game Flow
The first player to connect is the **white** player and can choose, which game mode
is chosen. If this very player selects an AI difficulty, no further player can join the
game lobby. Else the next connecting player is the **black** player and thus the opponent.
When both player are ready and all meshes have been loaded the game begins.

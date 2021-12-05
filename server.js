const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');

// options
const public_path = "dist";
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
const PORT = process.env.PORT || 8080;


// start server
let application = express();
let server = https.createServer(options, application);
let io = socketIO(server);

// DEV SERVER-----------------------------------------------------
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const {response} = require("express");
const compiler = webpack(webpackConfig);

application.use(require("webpack-dev-middleware")(compiler, {
    publicPath: webpackConfig.output.publicPath
}));
application.use(require("webpack-hot-middleware")(compiler));
// ---------------------------------------------------------------

application.use(express.static(public_path));


server.listen(PORT, () => {
    console.log(`Start of server on localhost:${PORT} ...`);
});


let white = {};
let black = {};
let player_count = 0;
let player_limit = 2;

io.on('connect', socket => {
    // Connect Player
    player_count++;
    if (player_count == 1) {
        connectPlayer(socket, white, "white")
    } else if (player_count == player_limit) {
        connectPlayer(socket, black, "black")
    } else {
        redirect(socket);
    }

    // Ready
    socket.on('player_ready', (data) => {
        if(socket.id === white.id){
            startWhiteGame(socket, data);
        }else{
            startBlackGame(socket, data);
        }
    })

    // Disconnect
    socket.on('disconnect', () => {
        disconnectPlayer(socket);
        player_count--;
        console.log(`${player_count} player active`);
    })
});

function connectPlayer(socket, player, color) {
    player.id = socket.id;
    player.color = color;
    player.ready = false;
    socket.emit("initiate", color);
    console.log(`Player ${player.color} registered`)
}

function disconnectPlayer(socket){
    if(socket.id === white.id){
        disconnected_player = white;
        white = {}
    }else{
        disconnected_player = black;
        black = {}
    }
    socket.disconnect()
    console.log(`Player ${disconnected_player.color} disconnected!`);
}

function redirect(socket){
    socket.emit("redirect");
    socket.disconnect();
    player_count--;
    console.log("Full Lobby. Connected Player rejected!")
}

function startWhiteGame(socket, data){
    Object.assign(white, data);
    if(data.other_player !== "human"){
        player_limit = 1;
        if(black !== {}){
            redirect(getSocketById(black.id))
        }
        socket.emit("ai_start", data)
    }else{
        socket.emit("human_start", data)
    }
    console.log(`Starting game for white!`);
}

function startBlackGame(socket, data){
    Object.assign(black, data);
    Object.assign(`Starting game for black!`);
    socket.emit("human_start", data);
}

function getSocketById(id){
    io.sockets.sockets.get(id)
}


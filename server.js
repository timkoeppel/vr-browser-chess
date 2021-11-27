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

// Socket
let player_count = 0;
io.on('connection', (socket) => {
    player_count++;
    if(player_count <= 2) {
        console.log(`${player_count} player active`);
    }else{
        console.log("User rejected due to full lobby!");
        socket.emit("redirect", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        socket.disconnect(true);
        player_count--;
    }

    /* Start game
    setTimeout(() => {
        socket.emit("start")
    }, 5000) */

    // Disconnection
    socket.on('disconnect', () => {
        player_count--;
        console.log(`${player_count} player active`);
    })
});



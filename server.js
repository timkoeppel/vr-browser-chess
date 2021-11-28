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
let player_1 = {};
let player_2 = {};
io.on('connection', (socket) => {
    // Start
    player_count++;
    if (player_count <= 2) {
        if (!isActive(player_1)) {
            connectPlayer(socket, player_1, 1);
        } else if (!isActive(player_2)) {
            connectPlayer(socket, player_2, 2);
        }
        console.log(`${player_count} player active`);
    } else {
        console.log("User rejected due to full lobby!");
        socket.emit("redirect", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        socket.disconnect(true);
        player_count--;
    }

    // Player change
    socket.on('player change in', (data) => {
        if (socket.id === player_1.id) {
            handleIncomingPlayerChange(player_1, player_2, data)
        } else {
            handleIncomingPlayerChange(player_2, player_1, data)
        }
    });

    socket.on('player ready', () => {
        if (socket.id === player_1.id) {
            player_1.ready = true;
        } else {
            player_2.ready = true;
        }

        if (player_1.ready && player_2.ready) {
            data_player_1 = transformToIPlayerData(player_1);
            data_player_2 = transformToIPlayerData(player_2);

            io.to(player_1.id).emit("start", [data_player_1, data_player_2, true]);
            io.to(player_2.id).emit("start", [data_player_2, data_player_1, true]);
        } else if (player_1.ready && !isActive(player_2)) {
            data_player_1 = transformToIPlayerData(player_1);
            data_player_2 = createAIPlayerData(data_player_1.ai, data_player_1.color);

            io.to(player_1.id).emit("start", [data_player_1, data_player_2, true]);
        } else if (player_2.ready && !isActive(player_1)) {
            data_player_2 = transformToIPlayerData(player_2);
            data_player_1 = createAIPlayerData(data_player_1.ai, data_player_1.color);

            io.to(player_2.id).emit("start", [data_player_2, data_player_1, true]);
        }
    });

    // Move
    socket.on('player move', (data) => {
        if (socket.id === player_1.id) {
            console.log(`Player 1 made move from ${data.from} to ${data.to}.`);
            if (player_2.name !== "AI") {
                io.to(player_2.id).emit("other player move", data);
            }
        } else if (socket.id === player_2.id) {
            console.log(`Player 2 made move from ${data.from} to ${data.to}.`);
            if (player_1.name !== "AI") {
                io.to(player_1.id).emit("other player move", data);
            }
        }
    });

    // Disconnection
    socket.on('disconnect', () => {
        if (socket.id === player_1.id) {
            disconnectPlayer(player_1)
        } else {
            disconnectPlayer(player_2)
        }
        player_count--;
        console.log(`${player_count} player active`);
    })
});

function isActive(player) {
    return Object.keys(player).length !== 0
}

function transformToIPlayerData(server_player_data) {
    let player_data = Object.assign({}, server_player_data);
    delete player_data.id;
    delete player_data.enu;
    delete player_data.ready;
    return player_data;
}

function handleIncomingPlayerChange(in_player, out_player, data) {
    Object.assign(in_player, data);
    io.to(out_player.id).emit("player change out", data);
    console.log(`Refresh data for Player ${out_player.enu} (${out_player.name}):\n`, data)
}

function connectPlayer(socket, player, enu) {
    player.id = socket.id;
    player.enu = enu;
    player.ready = false;
    socket.emit("player info request");
    let other_player = getOtherPlayer(player);
    if (isActive(other_player)) {
        const data = transformToIPlayerData(other_player);
        io.to(player.id).emit("player change out", data);
    }
    console.log(`Player ${player.enu} registered`)
}

function disconnectPlayer(player) {
    console.log(`${player.name} disconnected!`);
    player = {};
}

function getOtherPlayer(player) {
    if (player.enu === 1) {
        return player_2
    } else if (player.enu === 2) {
        return player_1
    } else {
        return {};
    }
}

function createAIPlayerData(ai, human_color) {
    const avatars = ["male_01", "male_02", "male_03", "female_01", "female_02", "female_03"];
    const avatar = "female_01";// TODO avatars[Math.floor(Math.random() * avatars.length)];
    const color = (human_color === "white") ? "black" : "white";
    return {
        name: "AI",
        color: color,
        avatar: avatar,
        controller: "gaze",
        ai: ai
    }
}



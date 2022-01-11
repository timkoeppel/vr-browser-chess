const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');
const performance = require('perf_hooks');

// options
const public_path = "dist";
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
const PORT = process.env.PORT || 8443;


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

let start = fs.readFileSync("start.txt", "utf8").split(", ");
let easy = fs.readFileSync("easy.txt", "utf8").split(", ");
let intermediate = fs.readFileSync("intermediate.txt", "utf8").split(", ");
let expert = fs.readFileSync("expert.txt", "utf8").split(", ");

// DATABASE
let game_started = false;
let white = {};
let black = {};
let player_count = 0;
let player_limit = 2;

// **************************************************************************************
// ************************************** SOCKET ****************************************
// **************************************************************************************
io.on('connect', socket => {
    // Connect Player
    player_count++;
    if (player_count === 1) {
        connectPlayer(socket, white, "white")
    } else if (player_count === player_limit) {
        connectPlayer(socket, black, "black")
    } else if (socket !== undefined) {
        redirect(socket);
    }

    // Selection -> Avatar preperation
    socket.on('selection_done', (data) => {
        if (socket.id === white.id) {
            prepareWhiteGame(socket, data);
        } else {
            prepareBlackGame(socket, data);
        }
    });

    // Preperation -> Start
    socket.on('preparation_done', () => {
        const t1 = performance.performance.now();
       if(socket.id === white.id){
           white.prepared = true;
       }else{
           black.prepared = true;
       }
       startGameIfBothReady();
       const t2 = performance.performance.now();
       start.push((t2 - t1).toFixed(2));
       fs.writeFile("./start.txt", start.join(", "), err => {
            if (err) {
                console.error(err)
            }
        });
    });

    // Move
    socket.on('player_move', (data) => {
        if (socket.id === white.id && black.player_type === "human") {
            makeMove(data, white, black)
        } else if (socket.id === black.id) {
            makeMove(data, black, white)
        }
    });

    // Performance
    socket.on('easy', (val) => {
        easy.push(val);
        fs.writeFile("./easy.txt", easy.join(", "), err => {
            if (err) {
                console.error(err)
            }
        });
    });
    socket.on('intermediate', (val) => {
        intermediate.push(val);
        fs.writeFile("./intermediate.txt", intermediate.join(", "), err => {
            if (err) {
                console.error(err)
            }
        });
    });
    socket.on('expert', (val) => {
        expert.push(val);
        fs.writeFile("./expert.txt", expert.join(", "), err => {
            if (err) {
                console.error(err)
            }
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        disconnectPlayer(socket);
    })
});


// **************************************************************************************
// ********************************** Helper Functions **********************************
// **************************************************************************************
function connectPlayer(socket, player, color) {
    player.id = socket.id;
    player.color = color;
    player.ready = false;
    player.prepared = false;
    socket.emit("initiate", color);
    console.log(`Player ${player.color} registered`);
    console.log(`${player_count}/${player_limit} player active`);
}

function disconnectPlayer(socket) {
    let disconnected_player;
    if (socket.id === white.id) {
        disconnected_player = white;
        white = {};
        if (black.player_type === "human") {
            io.to(black.id).emit('game_reset', "white");
        }
    } else {
        if (white.other_player === "human") {
            io.to(white.id).emit('game_reset', "black");
        }
        disconnected_player = black;
        black = {}
    }
    socket.disconnect();
    console.log(`Player ${disconnected_player.color} disconnected!`);
    player_count--;
    console.log(`${player_count}/${player_limit} player active.`);

    if (player_count === 0) {
        resetApp();
    }
}

function redirect(socket) {
    socket.emit("redirect", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    socket.disconnect();
    console.log("Full Lobby. Connected Player rejected!")
}

function prepareWhiteGame(socket, data) {
    Object.assign(white, data);
    white.ready = true;
    console.log(`Player ${white.color} is ready!`);
    socket.emit('ready', toIPlayerData(white));

    black.player_type = white.other_player;
    // Black should be played by an AI
    if (black.player_type !== "human") {
        player_limit = 1;
        const is_black_player_in_lobby = Object.keys(black).length > 3;

        // Black AI creation
        Object.assign(black, createAIData(black));
        console.log(`Player black is played by an ${black.player_type} AI!`);
        prepareGameIfBothReady(socket);

        // A person is already in as black player --> redirect
        if (is_black_player_in_lobby) {
            redirect(getSocketById(black.id))
        }
    } else {
        prepareGameIfBothReady(socket);
    }
}

function prepareBlackGame(socket, data) {
    Object.assign(black, data);
    black.ready = true;
    socket.emit('ready', toIPlayerData(black));
    console.log(`Player ${black.color} is ready!`);

    prepareGameIfBothReady(socket);
}

function getSocketById(id) {
    return io.sockets.sockets.get(id)
}

function toIPlayerData(player) {
    let data = Object.assign({}, player);
    delete data.id;
    delete data.ready;
    delete data.prepared;
    return data
}

function createAIData(player) {
    const avatars = ["male_01", "male_02", "male_03", "female_01", "female_02", "female_03"];
    const data = {
        ready: true,
        prepared: true,
        color: "black",
        controller: "gaze",
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        player_type: player.player_type
    };
    return Object.assign({}, data);
}

function resetApp() {
    white = {};
    black = {};
    player_limit = 2;
    game_started = false;
    console.log(`No player in the game anymore. Resetting the game ...`)
}

function prepareGameIfBothReady(socket) {
    if (socket.id === black.id && white.ready && black.ready) {
        console.log(`Preparing game ...`);
        socket.emit('prepare', [toIPlayerData(black), toIPlayerData(white)]);
        io.to(white.id).emit('prepare', [toIPlayerData(white), toIPlayerData(black)]);
        //game_started = true;
    } else if (socket.id === white.id && white.ready && black.ready) {
        console.log(`Preparing game ...`);
        socket.emit('prepare', [toIPlayerData(white), toIPlayerData(black)]);
        io.to(black.id).emit('prepare', [toIPlayerData(black), toIPlayerData(white)]);
        //game_started = true;
    }
}

function startGameIfBothReady(){
    if(white.prepared && black.prepared) {
        io.to(white.id).emit('start', [toIPlayerData(white), toIPlayerData(black)]);
        io.to(black.id).emit('start', [toIPlayerData(black), toIPlayerData(white)]);
    }
}

function makeMove(data, from_player, to_player) {
    console.log(`Player ${from_player.color} made move from ${data.from} to ${data.to}.`);
    io.to(to_player.id).emit('other_player_move', (data));
    console.log(`Send move to ${to_player.color} player ...`);
}





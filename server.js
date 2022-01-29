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
const PORT = process.env.PORT || 8443;


// start server
let application = express();
let server = https.createServer(options, application);
let io = socketIO(server);

// DEV SERVER-----------------------------------------------------
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
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

// **************************************************************************************
// ************************************* APP DATA ***************************************
// **************************************************************************************
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
    socket.on('avatar_preparation_done', (color) => {
        registerPreparation(socket, color);
    });

    // Move
    socket.on('player_move', (data) => {
        if (socket.id === white.id) {
            makeMove(data, white, black)
        } else if (socket.id === black.id) {
            makeMove(data, black, white)
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        disconnectPlayer(socket);
    });
});


// **************************************************************************************
// ********************************** Helper Functions **********************************
// **************************************************************************************
/**
 * Manages the connection of a user to the server
 * @param socket {socket}The involved socket for identification
 * @param player {object} The player object in the app data
 * @param color {"white" | "black"} The color assigned to the player
 */
function connectPlayer(socket, player, color) {
    player.id = socket.id;
    player.color = color;
    player.ready = false;
    player.white_avatar = false;
    player.black_avatar = false;
    player.player_type = "human";
    socket.emit("initiate", color);

    // If white is already ready and waiting for black to get ready
    if (color === "black" && white.ready) {
        socket.emit('prepare_other', toIPlayerData(white));
    }

    console.log(`Player ${player.color} registered`);
    console.log(`${player_count}/${player_limit} player active`);
}

/**
 * Manages the disconnection of a suser from the server
 * @param socket {socket} The involved socket for identification
 */
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

        // black was already prepared in white game and the data will be converted to AI data
        if (!white.black_avatar) {
            black = {}
        }
    }
    console.log(`Player ${disconnected_player.color} disconnected!`);
    player_count--;
    console.log(`${player_count}/${player_limit} player active.`);

    if (player_count === 0) {
        resetApp();
    }
}

/**
 * Manages the redirection of a user
 * @param socket {socket} The socket of the user to send the redirect request
 * @return {void}
 */
function redirect(socket) {
    socket.emit("redirect", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"); // RickRoll please change
    console.log("Full Lobby. Connected Player rejected!")
}

/**
 * Register white player readiness and prepares its game avatar.
 * If white chose Singleplayer mode it also handles the black player
 * @param socket {socket} The socket to send back data
 * @param data {IPlayerData} The PlayerData of the white player
 * @return {void}
 */
function prepareWhiteGame(socket, data) {
    Object.assign(white, data);
    white.ready = true;
    console.log(`Player ${white.color} is ready!`);
    socket.emit('prepare_own', toIPlayerData(white));

    // Black should be played by an AI
    if (white.other_player !== "human") {
        player_limit = 1;

        // A person is already in as black player --> redirect
        console.log(isConnected(black));
        if (isConnected(black)) {
            redirect(getSocketById(black.id))
        }

        Object.assign(black, createAIData(black, white.other_player));
        socket.emit("prepare_other", toIPlayerData(black));
        console.log(`Player black is played by an ${black.player_type} AI!`);
    } else {
        io.to(black.id).emit('prepare_other', toIPlayerData(white))
    }
    console.log(`Game of player white is prepared.`);
}

/**
 * Register white player readiness and prepares its game avatar.
 * @param socket {socket} The socket to send back data
 * @param data {IPlayerData} The PlayerData of the black player
 * @return {void}
 */
function prepareBlackGame(socket, data) {
    Object.assign(black, data);
    black.ready = true;
    socket.emit('prepare_own', toIPlayerData(black));
    io.to(white.id).emit('prepare_other', toIPlayerData(black));
    console.log(`Game of player black is prepared.`);
}

/**
 * Returns the searched socket via its ID
 * @param id {string} The ID of the socket, which is searched for
 * @return {socket}
 */
function getSocketById(id) {
    return io.sockets.sockets.get(id)
}

/**
 *
 * @param player {object} The player from the app data
 * @return {Object} The PlayerData for the frontend to use
 */
function toIPlayerData(player) {
    let data = Object.assign({}, player);
    delete data.id;
    delete data.ready;
    delete data.white_avatar;
    delete data.black_avatar;

    return data;
}

/**
 * Creates fitting AI data for the singleplayer mode
 * @param player {object} The player from the app data
 * @param player_type {"AI" | "easy" | "intermediate" | "expert"}
 * @return {{black_avatar: boolean, controller: string, color: string, ready: boolean, white_avatar: boolean, avatar: (string|GUI.Button|"male_01"|"male_02"|"male_03"|"female_01"|"female_02"|"female_03"|"male_01"|"male_02"|"male_03"|"female_01"|"female_02"|"female_03"|Avatar), player_type: (string|"human"|"easy"|"intermediate"|"expert"|"human"|"easy"|"intermediate"|"expert"|*)}}
 */
function createAIData(player, player_type) {
    const avatars = ["male_01", "male_02", "male_03", "female_01", "female_02", "female_03"];

    // special situation if black already loaded from other human player but white wants against AI
    const avatar = (player.avatar === undefined) ? avatars[Math.floor(Math.random() * avatars.length)] : player.avatar;

    const data = {
        ready: true,
        white_avatar: true,
        black_avatar: true,
        color: "black",
        controller: "gaze",
        avatar: avatar,
        player_type: player_type
    };
    return Object.assign({}, data);
}

/**
 * Registers the successful preparation of an avatar
 * @param socket {socket} The socket used for identification
 * @param color {"white" | "black"} The color of the avatar
 * @return {void}
 */
function registerPreparation(socket, color) {
    let prepared_player;
    let prepared_avatar_color;
    if (socket.id === white.id) {
        if (color === "white") {
            white.white_avatar = true;
            prepared_avatar_color = "white";
        } else {
            white.black_avatar = true;
            prepared_avatar_color = "black";
        }
        prepared_player = "white";
    } else {
        if (color === "white") {
            black.white_avatar = true;
            prepared_avatar_color = "white";
        } else {
            black.black_avatar = true;
            prepared_avatar_color = "black";
        }
        prepared_player = "black";
    }
    console.log(`Player ${prepared_player} prepared ${prepared_avatar_color} avatar.`);
    startGameIfBothReady();
}

/**
 * Resets the app data
 * @return {void}
 */
function resetApp() {
    white = {};
    black = {};
    player_limit = 2;
    console.log(`No player in the game anymore. Resetting the game ...`)
}

/**
 * Sends a start command to both users, when all avatars are
 * @return {void}
 */
function startGameIfBothReady() {
    if (white.white_avatar && white.black_avatar && black.white_avatar && black.black_avatar) {
        io.to(white.id).emit('start', [toIPlayerData(white), toIPlayerData(black)]);
        io.to(black.id).emit('start', [toIPlayerData(black), toIPlayerData(white)]);
        console.log(`Starting game ...`);
    }
}

/**
 * Registers move and sends it to the other human if necessary
 * @param data {Move} The move object from Chess.ts
 * @param from_player {object} The player from the app data, who made the move
 * @param to_player {object} The player from the app data, who shall receive the made move
 * @return {void}
 */
function makeMove(data, from_player, to_player) {
    console.log(`Player ${(data.color === "W" ? "white" : "black") } made move from ${data.from} to ${data.to}.`);

    if (black.player_type === "human") {
        io.to(to_player.id).emit('other_player_move', (data));
        console.log(`Send move to ${to_player.color} player ...`);
    }
}

/**
 * A simple check if a player from the app data is connected
 * @param player The involved player from the app data
 * @return {boolean}
 */
function isConnected(player) {
    return player.white_avatar !== undefined && player.black_avatar !== undefined && player.ready !== undefined && player.id !== undefined;
}





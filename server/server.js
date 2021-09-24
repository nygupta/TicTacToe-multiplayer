//utilities functions and classes
const { randRoom, randPiece } = require('./utilities/utils');
const Player = require('./utilities/player');
const Board = require('./utilities/board');

const cors = require('cors');
//set up express server
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());

//store the room id maping the room property object 
//which looks like this {roomid: "string", player: Array(2)}
const rooms = new Map();

//function to make sure the room id is unique;
const makeRoom = (resolve) => {
    var newRoom = randRoom();
    while(rooms.has(newRoom))
        newRoom = randRoom();
    rooms.set(
        newRoom,
        {
            roomId: newRoom,
            players: [],
            board: null
        }
    );
    resolve(newRoom);
};

//put joined player into rooms list 
const joinRoom = (player, room) => {
    currentRoom = rooms.get(room);
    updatedPlayerList = currentRoom.players.push(player);
    updateRoom = {
        ...currentRoom,
        players: updatedPlayerList
    };
};

//remove player from rooms list
function kick (room){
    currentRoom = rooms.get(room);
    currentRoom.players.pop();
};

//number of players in the current room
function getRoomPlayersNum(room) {
    return rooms.get(room).players.length;
}

//assign X/O to the players in room
function pieceAssignment(room) {
    const firstPiece = randPiece();
    const lastPiecr = firstPiece === 'X' ? 'O' : 'X';
    currentRoom = rooms.get(room);
    currentRoom.players[0].piece = firstPiece;
    currentRoom.players[1].piece = lastPiecr;
};

//initialise board to a room
function newGame(room) {
    currentRoom = rooms.get(room);
    const board = new Board;
    currentRoom.board = board;
};

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
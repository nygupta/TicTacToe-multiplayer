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

io.on('connection', socket => {
    //on the client submit event (on the start page) to crate a nwe room 
    socket.on('newGame', () => {
        new Promise(makeRoom)
            .then((room) => {
                socket.emit('newGameCreated', room);
            });
    });

    //on the client submit event (on start page) to join a room
    socket.on('joining', ({room}) => {
        if(rooms.has(room))
            socket.emit('joinConfermed');
        else 
            socket.emit('errorMessage', 'No room with that id found');
    });

    socket.on('newRoomJoin', ({room, name}) => {
        //if one tries to join a room without name or id then redirect to start
        if (room === '' || name === '')
            io.to(socket.id).emit('joinError');
        
        //put the new player in the room
        socket.join(room);
        const id = socket.id;
        const newPlayer = new Player(name, room, id);
        joinRoom(newPlayer, room);

        //get the number of players in the room
        const peopelInRoom = getRoomPlayersNum(room);

        //emit "waiting" while another player joins the room
        if (peopelInRoom === 1)
            io.to(room).emit('waiting');
        
        //need 2 player to start the game
        if (peopelInRoom === 2) {
            //assign piece to each player then emmit so it can be stored in state
            pieceAssignment(room);
            currentPlayer = rooms.get(room).players;
            for (const player of currentPlayer)
                io.to(player.id).emit('pieceAssignment', { piece: player.piece, id: player.id });
            newGame(room);

            //all the information is required to render the game in frontend
            const currentRoom = rooms.get(room);
            const gameState = currentRoom.board.game;
            const turn = currentRoom.board.turn;
            const playeys = currentRoom.players.map((player) => [player.id, player.name]);
            io.to(room).emit('starting', { gameState, players, turn });
        }

        //if extra player joins, then redirected to stating page
        if (peopelInRoom === 3) {
            socket.leave(room);
            kick(room);
            io.to(socket.id).emit('joinError');
        }
    });

    //event listner for each move and emit to game state
    socket.on('move', ({ room, piece, index }) => {
        currentBoard = rooms.get(room).board;
        currentBoard.move(index, piece);

        if (currentBoard.checkWinner(piece))
            io.to(room).emit('winner', { gameState: currentBoard.game, id: socket.id });
        else if (currentBoard.checkDraw())
            io.to(room).emit('draw', { gameState: currentBoard.game });
        else {
            currentBoard.switchTurn();
            io.to(room).emit('update', { gameState: currentBoard.game, turn: currentBoard.turn });
        }
    });

    //event listner for new game
    socket.on('playAgainRequest', (room) => {
        currentRoom = rooms.get(room);
        currentRoom.board.reset();

        //reasign new player so a player can't always go first
        pieceAssignment(room);
        currentPlayers = currentRoom.players;
        for (const player of currentPlayers)
            io.to(player.id).emit('pieceAssignment', { piece: player.piece, id: player.id });
        
        io.to(room).emit('restart', { gmaeState:  currentRoom.board.game, turn: currentRoom.board.turn});
    });

    //disconnect event handler
    socket.on('disconnecting', () => {
        //get all the room the socket is currently subscribed to 
        const currentRooms = Object.keys(socket.rooms);

        //a object can only have 2 room max
        if (currentRooms === 2) { 
            const room = currentRooms[1];
            const num = getRoomPlayersNum(room);
            if (num === 1)
                rooms.delete(room);
            if (num === 2) {
                currentRoom = rooms.get(room);
                currentRoom.players = currentRoom.players.filter((player) => player.id !== socket.id);
                io.to(room).emit('waiting'); 
            }
        }
    });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
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

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
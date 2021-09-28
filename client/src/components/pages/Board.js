import React, { Component } from "react";
import { Redirect } from "react-router";

import Square from "../functional/Square";
import Wait from "../functional/Wait";
import Status from "../functional/Status";
import ScoreBoard from "../functional/ScoreBoard";
import PlayAgain from "../functional/PlayAgain";

import io from 'socket.io-client';
import qs from 'qs';

const ENDPOINT = 'https://tictactoe-multiplayer.herokuapp.com/';

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: new Array(9).fill(null),
            piece: 'X',
            turn: true,
            end: false,
            room: '',
            statusMessage: '',
            currentPlayerScore: 0,
            opponentPlayer: [],
            waiting: false,
            joinError: false
        };
        this.socketId = null;
    };

    componentDidMount() {
        this.socket = io(ENDPOINT);
        const { room, name } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
        this.setState({ room });
        this.socket.emit('newRoomJoin', { room, name });

        this.socket.on(
            'waiting', 
            () => this.setState({
                waiting: true,
                currentPlayerScore: 0,
                opponentPlayer: []
            })
        );
        this.socket.on(
            'starting', 
            ({ gameState, players, turn }) => {
                this.setState({ waiting: false });
                this.gameStart(gameState, players, turn);
            }
        );
        this.socket.on('joiningError', () => this.setState({ joinError: true }));

        this.socket.on(
            'pieceAssignment',
            ({ piece, id }) => {
                this.setState({ piece: piece });
                this.socketId = id;
            }
        );

        this.socket.on('update', ({ gameState, turn }) => this.handleUpdate(gameState, turn));
        this.socket.on('winner', ({ gameState, id }) => this.handleWin(id, gameState));
        this.socket.on('draw', ({ gameState }) => this.handleDraw(gameState));
        this.socket.on('restart', ({ gameState, turn }) => this.handleRestart(gameState, turn));
    };

    gameStart(gameState, players, turn) {
        const opponent = players.filter(([id, name]) => id !== this.socketId)[0][1];
        this.setState({opponentPlayer: [opponent, 0], end: false});
        this.setBoard(gameState);
        this.setTurn(turn);
    };

    handleClick = (index) => {
        const { game, piece, end, turn, room } = this.state;
        if(!game[index] && !end && turn)
            this.socket.emit('move', { room, piece, index });
    };

    handleUpdate(gameState, turn) {
        this.setBoard(gameState);
        this.setTurn(turn);
        this.setMessage();
    };

    handleWin(id, gameState) {
        this.setBoard(gameState);
        if (this.socketId === id) {
            const playerScore = this.state.currentPlayerScore + 1;
            this.setState({ currentPlayerScore: playerScore, statusMessage: 'You Win' });
        }
        else {
            const opponentScore = this.state.opponentPlayer[1] + 1;
            const opponent = this.state.opponentPlayer;
            opponent[1] = opponentScore;
            this.setState({ opponentPlayer: opponent, statusMessage: `${this.state.opponentPlayer[0]} Wins` });
        }
        this.setState({ end: true });
    };

    handleDraw(gameState) {
        this.setBoard(gameState);
        this.setState({ end: true, statusMessage: 'Draw' });
    };

    playAgainRequest = () => {
        this.socket.emit('playAgainRequest', this.state.room);
    };

    handleRestart(gameState, turn) {
        this.setBoard(gameState);
        this.setTurn(turn);
        this.setMessage();
        this.setState({ end: false });
    };

    setMessage() {
        const message = this.state.turn?'Your Turn':`${this.state.opponentPlayer[0]}'s Turn`;
        this.setState({ statusMessage:message });
    };
    
    setTurn(turn ){
        if (this.state.piece === turn)
            this.setState({ turn:true });
        else
            this.setState({ turn:false });  
    };

    setBoard(gameState) {
        this.setState({ game:gameState });
    };

    renderSquare(i) {
        return (
            <Square
                key={i} 
                value={this.state.game[i]}
                player={this.state.piece} 
                end={this.state.end} 
                id={i} 
                onClick={this.handleClick}
                turn={this.state.turn}
            />
        );
    };

    render() {
        if(this.state.joinError)
            return(
                <Redirect to={'/'} />
            );
        else {
            const squareArray = [];
            for (let i = 0; i < 9; i++) {
                const newSquare = this.renderSquare(i);
                squareArray.push(newSquare);
            }
            return(
                <>
                    <Wait display={this.state.waiting} room={this.state.room} />
                    <Status message={this.state.statusMessage} />
                    <div className='board' > {squareArray} </div>
                    <ScoreBoard 
                        data={
                            {player1:['You', this.state.currentPlayerScore], 
                            player2:[this.state.opponentPlayer[0], this.state.opponentPlayer[1]]
                        }} 
                    />
                    <PlayAgain end={this.state.end} onClick={this.playAgainRequest} />
                </>
            );
        }
    };
};

export default Board;
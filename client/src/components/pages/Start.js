import React from 'react';
import { Redirect } from 'react-router-dom';
import socketIoClient from 'socket.io-client';

import Choice from '../functional/Choice';
import InputForm from '../functional/InputForm';
import Error from '../functional/Error';
import Loading from '../functional/Loading';
import logo from './logo.png';

const ENDPOINT = 'https://tictactoe-multiplayer.herokuapp.com/';

class Start extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            name: '',
            newGame: null,
            room: '',
            loading: false,
            serverConfermed: false,
            error: false,
            errorMessage: ''
        }
    };

    componentDidMount() {
        this.socket = socketIoClient(ENDPOINT);
        this.socket.on('newGameCreated', (room) => { 
            this.setState({ serverConfermed: true,room: room }); 
        });
        this.socket.on('joinConfirmed', () => {
            this.setState({ serverConfermed: true });
        });
        this.socket.on('errorMessage', (message) => this.displayError(message));
    };

    componentWillUnmount() {
        this.socket.disconnect();
    };

    onChoice = (choice) => {
        const gameChoice = choice === 'new' ? true : false;
        const newState = {newGame: gameChoice};
        this.setState(newState, () => {
            this.stepForward();
        });
    };

    validate = () => {
        if (this.state.newGame)
            return !(this.state.name === '');
        else 
            return !(this.state.name === '') && !(this.state.room === '');
    };

    onSubmit = () => {
        this.setState({ loading: true });
        if (this.validate()) {
            if (this.state.newGame)
                this.socket.emit('newGame');
            else 
                this.socket.emit('joining', { room: this.state.room });
        }
        else {
            setTimeout(() => this.setState({ loading: false }), 500);
            this.displayError(this.state.newGame 
                ? 'Please fill out your name'
                : 'Please fill out your name and room id');
        }
    };

    stepBack = () => {
        this.setState({ step: this.state.step - 1 });
    };

    stepForward = () => {
        this.setState({ step: this.state.step + 1 });
    }

    onTyping = (e) => {
        const target = e.target.name;
        const newState = {[target]: e.target.value};
        this.setState(newState);
    };

    displayError = (message) => {
        this.setState({ error: true, errorMessage: message, loading: false });
        setTimeout(() => {
            this.setState({ error: false, errorMessage: '' });
        }, 3000);
    };

    render() {
        if (this.state.serverConfermed)
            return (
                <Redirect to={`/game?room=${this.state.room}&name=${this.state.name}`} />
            );
        else {
            switch(this.state.step) {
                case(1) :
                    return (
                        <Choice logo={logo} onChoice={this.onChoice} />
                    );
                case(2) :
                    return (
                        <>
                            <Loading loading={this.state.loading} />
                            <Error display={this.state.error} message={this.state.errorMessage} />
                            <InputForm 
                                stepBack={this.stepBack} 
                                onSubmit={this.onSubmit} 
                                onTyping={this.onTyping.bind(this)}
                                newGame={this.state.newGame}
                                name = {this.state.name}
                                room = {this.state.room}
                            />
                        </>
                    );
                default:
                    return null;
            }
        }
    }
};
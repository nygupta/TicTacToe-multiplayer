import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import Start from './components/pages/Start';

const Game = () => (
    <Router>
        <Route path='/' exact component={Start} />
    </Router>
);

export default Game;
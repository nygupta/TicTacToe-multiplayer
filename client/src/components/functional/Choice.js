import React from "react";
import ChoiceButton from "./ChoiceButton";

const Choice = ({ logo, onChoice }) => {
    return (
        <>
            <div className='choice-container'>
                <a href="/"><img src={logo} alt='TicTacToe-Multiplayer'/></a>
                <ChoiceButton onChoice={onChoice} type='primary' choice='new' label='Sstart Game'/>
                <ChoiceButton onChoice={onChoice} type='secondary' choice='join' label='Join Game'/>
            </div>
        </>
    );
};

export default Choice;
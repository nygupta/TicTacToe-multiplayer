import React from "react";
import ChoiceButton from "./ChoiceButton";

const Choice = ({ logo, onChoice }) => {
    return (
        <>
            <div className='choice-container'>
                <a href="/"><img src={logo} alt='TicTacToe-Multiplayer'/></a>
                <ChoiceButton onChoice={onChoice} type='primary' choice='new' lable='Sstart Game'/>
                <ChoiceButton onChoice={onChoice} type='secondary' choice='join' lable='Join Game'/>
            </div>
        </>
    );
};

export default Choice;
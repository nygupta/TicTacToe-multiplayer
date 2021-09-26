import React from 'react';
import Input from './Input';
import ChoiceButton from './ChoiceButton';

const InputForm = (props) => {
    const { stepBack, onSubmit, onTyping, newGame, name, room } = props;

    if (newGame) {
        return (
            <div className='input-constainer'>
                <Input 
                    name='name'
                    placeholde='Your name...'
                    onChange={onTyping}
                    value={name}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' choice='back' onChoice={stepBack} lable='back' />
                    <ChoiceButton type='nav-forward' choice='submit' onChoice={onSubmit} lable='lets go...' />
                </div>
            </div>
        );
    }
    else {
        return (
            <div className='input-container'>
                <Input 
                    name='name'
                    placeholde='Your name...'
                    onChange={onTyping}
                    value={name}
                />
                <Input 
                    name='room'
                    placeholde='Room ID...'
                    onChange={onTyping}
                    value={room}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' choice='back' onChoice={stepBack} lable='back' />
                    <ChoiceButton type='nav-forward' choice='submit' onChoice={onSubmit} label='lets go...' />
                </div>
            </div>
        );
    }
};

export default InputForm;
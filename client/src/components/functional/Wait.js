import React, { useRef } from "react";

const Wait = ({ room, display }) => {
    const textArea = useRef(null);
    const onClick = () => {
        textArea.current.select();
        document.execCommand('copy');
    };

    return (
        <div className='wait' style={{ display: display ? 'flex' : 'none' }}>
            <h1 className='wait-message'>Waiting for player to connect...</h1>
            <div className='copy'>
                <h1 className='copy-message'>Give the other player following ID to join...</h1>
                <div className='copy-container'>
                    <input ref={textArea} readOnly={true} value={room} className='copy-area' />
                    <button className='copy-button' onClick={onclick}>Copy</button>
                </div>
            </div>
        </div>
    );
};

export default Wait;
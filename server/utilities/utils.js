const randRoom = () => {
    var roomId = '';
    var hexChars = '0123456789abcdef';
    for (var i = 0; i < 16; i += 1)
        roomId += hexChars[Math.floor(Math.random() * 16)];
    return roomId;
}

const randPiece = () => {
    return Math.random() > 0.5 ? 'X' : 'O';
}

module.exports = {randRoom, randPiece};
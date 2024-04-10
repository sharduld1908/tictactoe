import { io } from 'socket.io-client';

// const URL = 'https://tictactoe-server-f0f96fe5e12f.herokuapp.com/';
const URL = 'http://localhost:4000/';

export const socket = io(URL, {
    autoConnect: false
});
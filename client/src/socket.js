import { io } from 'socket.io-client';
const URL = 'https://tictactoe-server-f0f96fe5e12f.herokuapp.com/';
export const socket = io(URL, {
    autoConnect: false
});
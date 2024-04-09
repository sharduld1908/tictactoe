/* eslint-disable no-unused-vars */
import { Navigate } from 'react-router-dom'
import qs from 'qs'
import { useEffect } from 'react';

import { socket } from '../../socket';
import { useState } from 'react';
import Square from '../functional/Square';
import Wait from '../functional/Wait'
import Status from '../functional/Status'
import ScoreBoard from '../functional/ScoreBoard'
import PlayAgain from '../functional/PlayAgain'
import { useRef } from 'react';



const Board = () => {

    const [ game, setGame] = useState(new Array(9).fill(null));
    const [ turn, setTurn ] = useState(true);
    const [ end, setEnd ] = useState(false);
    const [ room, setRoom ]= useState('');
    const [ statusMessage, setStatusMessage ] = useState('');
    const [ currentPlayerScore, setCurrentPlayerScore] = useState(0);
    // const [ opponentPlayer, setOpponentPlayer ] = useState([]);
    const [ waiting, setWaiting ] = useState(false);
    const [ joinError, setJoinError] = useState(false);
    const [ isConnected, setIsConnected] = useState(socket.connected);
    
    let socketID = useRef(null);
    let myPiece = useRef('X');
    
    useEffect(() => {

        socket.connect();

        function onConnect() {
            setIsConnected(true);
        }
    
        function onDisconnect() {
            setIsConnected(false);
        }

        function onWaiting() {
            console.log("Waiting");
            setWaiting(true);
            setCurrentPlayerScore(0);
            // setOpponentPlayer([]);
        }

        function onStarting({ gameState, players, turn }) {
            setWaiting(false);
            gameStart(gameState, players, turn);
        }

        function onJoinError() {
            setJoinError(true);
        }

        function onPieceAssigment({piece, id}) {
            console.log("Piece Assignment", piece,id);
            myPiece.current = piece;
            socketID.current = id;
        }

        function onUpdate({gameState, turn}) {
            handleUpdate(gameState, turn);
        }

        function onWinner({gameState,id}) {
            console.log("Winner", gameState,id);
            handleWin(id, gameState);
        }

        function onDraw({gameState}) {
            handleDraw(gameState);
        }

        function onRestart({gameState, turn}) {
            console.log("Restart", gameState, turn);
            handleRestart(gameState, turn);
        }
        
        const {roomID, playerName} = qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        });

        setRoom(roomID);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on('waiting', onWaiting);
        socket.on('starting', onStarting);
        socket.on('joinError', onJoinError);
        socket.on('pieceAssignment', onPieceAssigment);
        socket.on('update', onUpdate);
        socket.on('winner', onWinner);
        socket.on('draw', onDraw);
        socket.on('restart', onRestart);

        if(isConnected) {
            let data = {room: roomID, name: playerName}
            socket.emit("newRoomJoin", data);
        }

        return () => {
            socket.disconnect();

            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);

            socket.off('waiting', onWaiting);
            socket.off('starting', onStarting);
            socket.off('joinError', onJoinError);
            socket.off('pieceAssignment', onPieceAssigment);
            socket.off('update', onUpdate);
            socket.off('winner', onWinner);
            socket.off('draw', onDraw);
            socket.off('restart', onRestart);

        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    //Setting the states to start a game when new user join
    function gameStart(gameState, players, turn) {
        // const opponent = players.filter(([id, name]) => id !== socketID.current)[0][1]
        
        // setOpponentPlayer([opponent,0]);
        setEnd(false);
        
        setBoard(gameState);
        setGameTurn(turn);
    }

    // When some one make a move, emit the event to the back end for handling
    const handleClick = (index) => {
        if (!game[index] && !end && turn && isConnected) {
            const data = {room:room, piece:myPiece.current,index:index}
            socket.emit('move', data)
        }
    }

    // Setting the states each move when the game haven't ended (no wins or draw)
    function handleUpdate(gameState, turn){
        setBoard(gameState);
        setGameTurn(turn);
    }

    // Setting the states when some one wins
    function handleWin(id, gameState) {
        setBoard(gameState)
        if (socketID.current === id) {
            console.log("Winner");
            setCurrentPlayerScore(currentPlayerScore+1);
            setStatusMessage("You Win");
        }
        else{
            // const opponentScore = opponentPlayer[1] + 1
            // const opponent = opponentPlayer
            // opponent[1] = opponentScore
            // setOpponentPlayer(opponent);
            setStatusMessage(`You Lost`);
        }
        setEnd(true);
    }

    // Setting the states when there is a draw at the end
    function handleDraw(gameState){
        setBoard(gameState);
        setEnd(true);
        setStatusMessage('Draw');
    }

    const playAgainRequest = () => {
        socket.emit('playAgainRequest', room)
    }

    // Handle the restart event from the back end
    function handleRestart(gameState, turn){
        setEnd(false);
        setBoard(gameState);
        setGameTurn(turn);
    }

    useEffect(() => {
        const message = turn ? 'Your Turn': `Waiting...`
        setStatusMessage(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[turn])
    
    function setGameTurn(turn) {
        if (myPiece.current === turn){
            setTurn(true);
        }
        else{
            setTurn(false);
        }
    } 

    function setBoard(gameState) {
        setGame(gameState);
    }

    function renderSquare(i) {
        return(
          <Square 
            key={i} 
            value={game[i]} 
            player={myPiece.current} 
            end={end} 
            id={i} 
            onClick={handleClick}
            turn={turn}
            /> 
        )
    }
    
    if (joinError){
        return <Navigate to='/' />
    }
    else {
        const squareArray = []
        for (let i=0; i<9; i++){
            const newSquare = renderSquare(i)
            squareArray.push(newSquare)
        }
        return(
            <>
                <Wait display={waiting} room={room}/>
                <Status message={statusMessage}/>
                <div className="board">
                    {squareArray}
                </div>
                {/* <ScoreBoard data={{player1:['You', currentPlayerScore], player2:[opponentPlayer[0], opponentPlayer[1]]}}/> */}
                <PlayAgain end={end} onClick={playAgainRequest}/>
            </>
        )
    }
}

export default Board;
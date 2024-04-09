import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'
import { socket } from '../../socket';

import Choice from '../functional/Choice';
import Loading from '../functional/Loading';
import Error from '../functional/Error';
import InputForm from '../functional/InputForm';

import logo from '../../assets/logo.png'

const Start = () => {

    // State Variables
    const [ serverConfirmed, setServerConfirmed ] = useState(false);
    const [ step, setStep ] = useState(1);
    const [formState, setFormState] = useState({
        name: '',
        room: ''
    });
    const [ newGame, setNewGame ] = useState(null);
    const [ room, setRoom ] = useState('');
    const [ error, setError ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ isConnected, setIsConnected] = useState(socket.connected);
    
    // Should only happen once
    useEffect(() => {
        socket.connect();

        function onConnect() {
            setIsConnected(true);
        }
    
        function onDisconnect() {
            setIsConnected(false);
        }

        function onNewGameCreated(room) {
            setServerConfirmed(true);
            setRoom(room);
        }

        function onJoinConfirmed(room) {
            setServerConfirmed(true);
            setRoom(room);
        }

        function onErrorMessage(message) {
            displayError(message)
        }
        
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('newGameCreated', onNewGameCreated);
        socket.on('joinConfirmed', onJoinConfirmed);
        socket.on('errorMessage', onErrorMessage);

        // Clean up function to disconnect the socket when the component unmounts
        return () => {
            socket.disconnect();
            
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('newGameCreated', onNewGameCreated);
            socket.off('joinConfirmed', onJoinConfirmed);
            socket.off('errorMessage', onErrorMessage);

        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    const onChoice = (choice) =>{
        const gameChoice = choice === 'new' ? true : false;
        setNewGame(gameChoice);
        stepForward();
    }

    const stepBack = () => {
        setStep((step-1));
    }

    const stepForward = () => {
        setStep((step+1));
    }

    const onTyping = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }

    const validate = () => {
        if (newGame) {
            return !(formState.name === '');
        }
        else {
            return !(formState.name === '') && !(formState.name === '');
        }
    }

    const onSubmit = () => {
        setLoading(true);
        if (validate()){
            if (newGame) {
                if(isConnected)
                    socket.emit('newGame');
            }
            else{
                if(isConnected)
                    socket.emit('joining', {room: formState.room});
            }
        }
        else{
            setTimeout(()=>setLoading(false), 500);
            displayError(newGame ? 'Please fill out your name':'Please fill out your name and room id');
        }
    }

    const displayError = (message) => {
        setError(true);
        setErrorMessage(message);
        setLoading(false);

        setTimeout(()=>{
            setError(false);
            setErrorMessage('');
        }, 3000)
    }

    // Rendering logic
    if(serverConfirmed) {
        return (
            <Navigate to={`/game?roomID=${room}&playerName=${formState.name}`}/>
        );
    }
    else {
        if(step == 1) {
            return (
                <Choice logo={logo} onChoice={onChoice}/>
            );
        }
        else if(step == 2) {
            return (
                <>
                    <Loading loading={loading}/>
                    <Error display={error} message={errorMessage}/>
                    <InputForm 
                        stepBack={stepBack} 
                        onSubmit={onSubmit} 
                        onTyping={onTyping.bind(this)}
                        newGame={newGame}
                        name = {formState.name}
                        room = {formState.room}
                    /> 
                </>
            );
        }
        else {
            return null;
        }
    }
}

export default Start;
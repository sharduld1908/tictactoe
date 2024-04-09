import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import Start from './components/pages/Start';
import Board from './components/pages/Board'

const Game = () => (
    <Router>
        <Routes>
            <Route path='/' Component={Start} />
            <Route path='/game' Component={Board} />
        </Routes>
    </Router>
)
 
export default Game;
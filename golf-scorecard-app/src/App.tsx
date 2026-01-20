import React, { useState } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import './App.css';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<'home' | 'game' | 'leaderboard'>('home');
    const [players, setPlayers] = useState<string[]>([]);
    const [strokes, setStrokes] = useState<string[][][]>([]);
    const [shotTypes, setShotTypes] = useState<string[][][]>([]);
    const [currentHole, setCurrentHole] = useState(1);
    const [courseInfo, setCourseInfo] = useState<{ name: string; par: number[]; yardage: number[]; teeColor: string } | null>(null);

    // Update startGame to accept courseInfo
    const startGame = (playerNames: string[], selectedCourseInfo: { name: string; par: number[]; yardage: number[]; teeColor: string } | null) => {
        setPlayers(playerNames);
        setCourseInfo(selectedCourseInfo);

        const initialStrokes = Array.from({ length: 18 }, () =>
            Array.from({ length: playerNames.length }, () => [])
        );
        const initialShotTypes = Array.from({ length: 18 }, () =>
            Array.from({ length: playerNames.length }, () => [])
        );

        setStrokes(initialStrokes);
        setShotTypes(initialShotTypes);
        setCurrentHole(1);
        setCurrentPage('game');
    };

    return (
        <div className="App">
            {currentPage === 'home' && <Home startGame={startGame} />}
            {currentPage === 'game' && courseInfo && (
                <Game
                    players={players}
                    strokes={strokes}
                    setStrokes={setStrokes}
                    shotTypes={shotTypes}
                    setShotTypes={setShotTypes}
                    currentHole={currentHole}
                    setCurrentHole={setCurrentHole}
                    goToLeaderboard={() => setCurrentPage('leaderboard')}
                    courseInfo={courseInfo}
                />
            )}
            {currentPage === 'leaderboard' && (
                <Leaderboard
                    players={players}
                    strokes={strokes}
                    shotTypes={shotTypes}
                    goToGame={() => setCurrentPage('game')}
                />
            )}
        </div>
    );
};

export default App;
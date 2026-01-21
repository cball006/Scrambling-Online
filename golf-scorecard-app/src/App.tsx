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
  const [courseInfo, setCourseInfo] = useState<{
    name: string;
    par: number[];
    yardage: number[];
    teeColor: string;
  } | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>(''); // in-memory token

  // Helper: Join session and get token from backend
  const joinSession = async (name: string, password: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8080/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to join session");
      }

      setSessionName(name);
      setSessionToken(data.token); // store token for game
      return data.token;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  };

  // Start game and navigate to Game page
  const startGame = (
    playerNames: string[],
    selectedCourseInfo: { name: string; par: number[]; yardage: number[]; teeColor: string } | null,
    session: string,
    token: string
  ) => {
    setPlayers(playerNames);
    setCourseInfo(selectedCourseInfo);
    setSessionName(session);
    setSessionToken(token);
    setCurrentHole(1);

    const initialStrokes = Array.from({ length: 18 }, () =>
      Array.from({ length: playerNames.length }, () => [])
    );
    const initialShotTypes = Array.from({ length: 18 }, () =>
      Array.from({ length: playerNames.length }, () => [])
    );

    setStrokes(initialStrokes);
    setShotTypes(initialShotTypes);
    setCurrentPage('game');
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <Home startGame={startGame} joinSession={joinSession} />
      )}

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
          sessionName={sessionName}
          sessionToken={sessionToken}
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

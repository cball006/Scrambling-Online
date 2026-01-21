import React, { useState, useEffect } from 'react';
import './Home.css';

interface TeeInfo {
  color: string;
  par: number[];
  yardage: number[];
}

interface CourseInfo {
  name: string;
  tees: TeeInfo[];
}

interface HomeProps {
  startGame: (
    playerNames: string[],
    courseInfo: { name: string; par: number[]; yardage: number[]; teeColor: string } | null,
    sessionName: string,
    sessionToken: string
  ) => void;
  joinSession: (name: string, password: string) => Promise<string | null>;
}

interface Session {
  name: string;
}

const Home: React.FC<HomeProps> = ({ startGame, joinSession }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [courseQuery, setCourseQuery] = useState('');
  const [courseResults, setCourseResults] = useState<CourseInfo[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [selectedTeeIdx, setSelectedTeeIdx] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionPassword, setSessionPassword] = useState('');
  const [joined, setJoined] = useState(false);

  const BACKEND_URL = 'http://127.0.0.1:8080';

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data.map((s: any) => ({ name: s.name })));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sessions');
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName || !sessionPassword) {
      setError('Session name and password are required');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sessionName, password: sessionPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Failed to create session');
        setJoined(false);
      } else {
        setError(null);
        setJoined(true);
        fetchSessions();
        alert(`Session "${sessionName}" created. You can now start the game.`);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create session');
      setJoined(false);
    }
  };

  const handleJoinSessionAndStart = async () => {
    setError(null);

    if (!sessionName || !sessionPassword) {
      setError('Session name and password are required');
      return;
    }

    const token = await joinSession(sessionName, sessionPassword);
    if (!token) {
      setError('Failed to join session');
      setJoined(false);
      return;
    }

    setJoined(true);

    if (!selectedCourse || selectedCourse.tees.length === 0) {
      setError('You must select a course and tee before starting the game');
      return;
    }

    const filteredNames = playerNames.filter((name) => name.trim() !== '');
    if (filteredNames.length === 0) {
      setError('You must enter at least one player');
      return;
    }

    const tee = selectedCourse.tees[selectedTeeIdx];

    startGame(
      filteredNames,
      {
        name: selectedCourse.name,
        par: tee.par,
        yardage: tee.yardage,
        teeColor: tee.color,
      },
      sessionName,
      token
    );
  };

  const handleNameChange = (index: number, value: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = value;
    setPlayerNames(updatedNames);
  };

  const addPlayer = () => setPlayerNames([...playerNames, '']);

  const handleCourseSearch = async () => {
    setLoading(true);
    setError(null);
    setCourseResults([]);
    setSelectedCourse(null);
    setSelectedTeeIdx(0);

    try {
      const response = await fetch(
        `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(courseQuery)}`,
        {
          headers: {
            Authorization: `Key ${process.env.REACT_APP_GOLF_API_KEY}`,
          },
        }
      );
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const courses: CourseInfo[] = (data.courses || []).map((course: any) => ({
        name: course.course_name || course.club_name || 'Unknown Course',
        tees: (course.tees?.male || []).map((tee: any) => ({
          color: tee.tee_name || tee.name || tee.color_type || tee.tee_type || tee.color || 'Unknown',
          par: tee.holes?.map((hole: any) => hole.par) || [],
          yardage: tee.holes?.map((hole: any) => hole.yardage) || [],
        })),
      }));
      setCourseResults(courses);
    } catch (err) {
      setError('Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1 style={{ textAlign: 'center', color: '#2380d7' }}>Game Setup</h1>

      {/* --- Session Management --- */}
      <div style={{ marginBottom: 20 }}>
        <h2>Sessions</h2>
        <ul>
          {sessions.map((s) => (
            <li
              key={s.name}
              style={{ cursor: 'pointer', fontWeight: s.name === sessionName ? 'bold' : 'normal' }}
              onClick={() => setSessionName(s.name)}
            >
              {s.name}
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Session Name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          style={{ marginRight: 4 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={sessionPassword}
          onChange={(e) => setSessionPassword(e.target.value)}
          style={{ marginRight: 4 }}
        />
        <button onClick={handleCreateSession}>Create</button>
        <button onClick={handleJoinSessionAndStart}>Join & Start Game</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {joined && <div style={{ color: 'green' }}>Joined session "{sessionName}"</div>}
      </div>

      {/* --- Player Inputs --- */}
      <div className="player-inputs">
        <h2>Players</h2>
        {playerNames.map((name, index) => (
          <div key={index} className="player-input">
            <input
              type="text"
              placeholder={`Player ${index + 1}`}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
            />
            {index === playerNames.length - 1 && <button onClick={addPlayer}>Add Player</button>}
          </div>
        ))}
      </div>

      {/* --- Golf Course Selection --- */}
      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <h2>Select Golf Course</h2>
        <input
          type="text"
          placeholder="Enter course name"
          value={courseQuery}
          onChange={(e) => setCourseQuery(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleCourseSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>

        {courseResults.length > 0 && (
          <ul
            style={{
              listStyle: 'disc',
              margin: '16px 0',
              paddingLeft: 40,
              textAlign: 'left',
              display: 'inline-block',
            }}
          >
            {courseResults.map((course, idx) => (
              <li
                key={idx}
                className={selectedCourse?.name === course.name ? 'selected' : ''}
                onClick={() => setSelectedCourse(course)}
                style={{
                  cursor: 'pointer',
                  fontWeight: selectedCourse?.name === course.name ? 'bold' : 'normal',
                  marginBottom: 4,
                }}
              >
                {course.name}
              </li>
            ))}
          </ul>
        )}

        {selectedCourse && selectedCourse.tees.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
              Selected Course: {selectedCourse.name}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label htmlFor="tee-select" style={{ fontWeight: 'bold', marginRight: 8 }}>
                Tee:
              </label>
              <select
                id="tee-select"
                value={selectedTeeIdx}
                onChange={(e) => setSelectedTeeIdx(Number(e.target.value))}
              >
                {selectedCourse.tees.map((tee, idx) => (
                  <option key={tee.color + idx} value={idx}>
                    {tee.color}
                  </option>
                ))}
              </select>
            </div>
            <div>Par for each hole: {selectedCourse.tees[selectedTeeIdx].par.join(', ')}</div>
            <div>Yardage for each hole: {selectedCourse.tees[selectedTeeIdx].yardage.join(', ')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

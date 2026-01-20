import React, { useState } from 'react';

interface PlayerInputProps {
    addPlayer: (name: string, score: number) => void;
}

const PlayerInput: React.FC<PlayerInputProps> = ({ addPlayer }) => {
    const [name, setName] = useState('');
    const [score, setScore] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addPlayer(name, score);
        setName('');
        setScore(0);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Player Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="number"
                placeholder="Score"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
            />
            <button type="submit">Add Player</button>
        </form>
    );
};

export default PlayerInput;
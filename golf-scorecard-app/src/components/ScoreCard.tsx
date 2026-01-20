import React from 'react';

interface Player {
    name: string;
    score: number;
}

interface ScoreCardProps {
    players: Player[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({ players }) => {
    return (
        <div>
            <h2>Scorecard</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>
                        {player.name}: {player.score}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScoreCard;
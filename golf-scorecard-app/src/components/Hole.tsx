import React from 'react';

interface HoleProps {
    holeNumber: number; // Current hole number (1-based index)
    courseInfo: {
        name: string;
        par: number[];
        yardage: number[];
    };
    totalStrokes?: number; // Optional, if you want to pass total strokes
}

const Hole: React.FC<HoleProps> = ({ holeNumber, courseInfo, totalStrokes }) => {
    const parForHole = courseInfo.par[holeNumber - 1]; // Get the par for the current hole

    return (
        <div className="hole-container">
            <h1 style={{ textAlign: 'center', color: '#2380d7', marginBottom: 0 }}>{courseInfo.name}</h1>
            {/* Cohesive hole and par info */}
            <div
                style={{
                    margin: '32px auto 0 auto',
                    padding: '18px 40px',
                    background: '#e3f2fd',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontSize: '2rem',
                    color: '#1976d2',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                    textAlign: 'center'
                }}
            >
                Hole {holeNumber} &nbsp;|&nbsp; Par {parForHole}
            </div>
            {/* Total strokes info aligned right */}
            {typeof totalStrokes === 'number' && (
                <div
                    style={{
                        marginTop: 24,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <div
                        style={{
                            background: '#fffde7',
                            borderRadius: '12px',
                            padding: '18px 32px',
                            color: '#f9a825',
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            boxShadow: '0 2px 8px rgba(249, 168, 37, 0.08)',
                            minWidth: 180,
                            textAlign: 'center'
                        }}
                    >
                        Total Strokes: {totalStrokes}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hole;
// filepath: c:\Users\cball\Desktop\scrambling\golf-scorecard-app\src\components\Hole.tsx
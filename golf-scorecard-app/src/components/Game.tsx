import React, { useState } from "react";
import Hole from "./Hole";
import html2canvas from "html2canvas";

interface GameProps {
  players: string[];
  strokes: string[][][]; // Tracks selected players for each stroke
  setStrokes: React.Dispatch<React.SetStateAction<string[][][]>>;
  shotTypes: string[][][]; // Tracks shot types for each stroke
  setShotTypes: React.Dispatch<React.SetStateAction<string[][][]>>;
  currentHole: number;
  setCurrentHole: React.Dispatch<React.SetStateAction<number>>;
  goToLeaderboard: () => void;
  courseInfo: {
    name: string;
    par: number[];
    yardage: number[];
  };
}

const Game: React.FC<GameProps> = ({
  players,
  strokes,
  setStrokes,
  shotTypes,
  setShotTypes,
  currentHole,
  setCurrentHole,
  goToLeaderboard,
  courseInfo,
}) => {
  const shotTypeOptions = [
    "Drive",
    "Par 3",
    "Hybrid",
    "Iron",
    "Approach",
    "Chip",
    "Putt",
    "Gimme",
    "Water Hazard",
  ];

  // Calculate the cumulative strokes across all holes
  const totalStrokes = shotTypes.reduce((total, hole) => {
    return (
      total +
      hole.reduce((holeTotal, stroke) => {
        return holeTotal + (stroke[0] ? 1 : 0);
      }, 0)
    );
  }, 0);

  const addStroke = () => {
    const updatedStrokes = [...strokes];
    const updatedShotTypes = [...shotTypes];

    if (!updatedStrokes[currentHole - 1]) {
      updatedStrokes[currentHole - 1] = [];
    }
    if (!updatedShotTypes[currentHole - 1]) {
      updatedShotTypes[currentHole - 1] = [];
    }

    updatedStrokes[currentHole - 1].push([]);
    updatedShotTypes[currentHole - 1].push([]);

    setStrokes(updatedStrokes);
    setShotTypes(updatedShotTypes);
  };

  const removeStroke = (strokeIndex: number) => {
    const updatedStrokes = [...strokes];
    const updatedShotTypes = [...shotTypes];

    if (updatedStrokes[currentHole - 1]) {
      updatedStrokes[currentHole - 1].splice(strokeIndex, 1);
    }
    if (updatedShotTypes[currentHole - 1]) {
      updatedShotTypes[currentHole - 1].splice(strokeIndex, 1);
    }

    setStrokes(updatedStrokes);
    setShotTypes(updatedShotTypes);
  };

  const togglePlayerForStroke = (strokeIndex: number, playerName: string) => {
    const updatedStrokes = [...strokes];
    const currentStrokePlayers =
      updatedStrokes[currentHole - 1][strokeIndex] || [];

    if (currentStrokePlayers.includes(playerName)) {
      updatedStrokes[currentHole - 1][strokeIndex] =
        currentStrokePlayers.filter((name) => name !== playerName);
    } else {
      updatedStrokes[currentHole - 1][strokeIndex] = [
        ...currentStrokePlayers,
        playerName,
      ];
    }

    setStrokes(updatedStrokes);
  };

  const selectShotType = (strokeIndex: number, shotType: string) => {
    const updatedShotTypes = [...shotTypes];
    const currentPlayers = strokes[currentHole - 1][strokeIndex] || [];

    if (shotType === "Gimme" || shotType === "Water Hazard") {
      updatedShotTypes[currentHole - 1][strokeIndex] = [shotType];
    } else {
      updatedShotTypes[currentHole - 1][strokeIndex] = currentPlayers.map(
        () => shotType
      );
    }

    setShotTypes(updatedShotTypes);
  };

  const nextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);

      if (!strokes[currentHole]) {
        setStrokes([...strokes, []]);
      }
      if (!shotTypes[currentHole]) {
        setShotTypes([...shotTypes, []]);
      }
    } else {
      alert("Game Over!");
    }
  };

  const previousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
    }
  };

  // Editable par state and edit mode
  const [editablePar, setEditablePar] = useState<number>(
    courseInfo.par[currentHole - 1]
  );
  const [editingPar, setEditingPar] = useState<boolean>(false);

  React.useEffect(() => {
    setEditablePar(courseInfo.par[currentHole - 1]);
    setEditingPar(false);
  }, [currentHole, courseInfo.par]);

  const handleParChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPar = Number(e.target.value);
    setEditablePar(newPar);
  };

  const savePar = () => {
    const updatedPar = [...courseInfo.par];
    updatedPar[currentHole - 1] = editablePar;
    courseInfo.par = updatedPar;
    setEditingPar(false);
  };

  const exportLeaderboardToDiscord = async () => {
    const leaderboardElement = document.querySelector(".leaderboard-container");
    if (!leaderboardElement) {
      alert("Leaderboard not found!");
      return;
    }
    const canvas = await html2canvas(leaderboardElement as HTMLElement);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) {
      alert("Failed to generate image.");
      return;
    }
    const formData = new FormData();
    formData.append("file", blob, "leaderboard.png");
    formData.append(
      "payload_json",
      JSON.stringify({ content: "Leaderboard export" })
    );

    await fetch(process.env.REACT_APP_DISCORD_WEBHOOK_URL || "", {
      method: "POST",
      body: formData,
    });
    alert("Leaderboard exported to Discord!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#2380d7", marginBottom: 0 }}>
        {courseInfo.name}
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 32,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: "18px 5vw",
            background: "#e3f2fd",
            borderRadius: "12px",
            fontSize: "clamp(1.2rem, 6vw, 2rem)",
            color: "#1976d2",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
            textAlign: "center",
            minWidth: 120,
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1vw",
            maxWidth: "95vw",
          }}
        >
          Hole {currentHole} &nbsp;|&nbsp; Par{" "}
          {editingPar ? (
            <input
              type="number"
              value={editablePar}
              min={1}
              max={10}
              autoFocus
              onChange={handleParChange}
              onBlur={savePar}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePar();
              }}
              style={{
                width: "3em",
                fontSize: "clamp(1rem, 5vw, 1.5rem)",
                textAlign: "center",
                border: "1px solid #1976d2",
                borderRadius: "6px",
                marginLeft: 8,
                background: "#e3f2fd",
                color: "#1976d2",
                fontWeight: "bold",
              }}
            />
          ) : (
            <span
              style={{
                marginLeft: 8,
                cursor: "pointer",
                color: "#1976d2",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
              title="Click to edit par"
              onClick={() => setEditingPar(true)}
            >
              {editablePar}
            </span>
          )}
        </div>
        <div
          style={{
            background: "#fffde7",
            borderRadius: "12px",
            padding: "10px 24px",
            color: "#f9a825",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 2px 8px rgba(249, 168, 37, 0.08)",
            minWidth: 120,
            textAlign: "center",
          }}
        >
          Total Strokes: {totalStrokes}
        </div>
      </div>
      <div style={{ overflowX: "auto", marginBottom: "20px" }}>
        <table
          style={{
            margin: "0 auto",
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                Stroke
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                Player
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                Shot Type
              </th>
            </tr>
          </thead>
          <tbody>
            {strokes[currentHole - 1]?.map((strokePlayers, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    whiteSpace: "nowrap",
                  }}
                >
                  Stroke {index + 1}{" "}
                  <span
                    onClick={() => removeStroke(index)}
                    style={{
                      cursor: "pointer",
                      color: "red",
                      marginLeft: "10px",
                      fontSize: "1.2rem",
                    }}
                    title="Remove Stroke"
                  >
                    🗑️
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    {players.map((playerName) => (
                      <button
                        key={playerName}
                        onClick={() => togglePlayerForStroke(index, playerName)}
                        style={{
                          padding: "10px",
                          backgroundColor: strokePlayers?.includes(playerName)
                            ? "#1976d2"
                            : "#ccc",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        {playerName}
                      </button>
                    ))}
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    whiteSpace: "nowrap",
                  }}
                >
                  <select
                    value={shotTypes[currentHole - 1]?.[index]?.[0] || ""}
                    onChange={(e) => selectShotType(index, e.target.value)}
                    style={{
                      padding: "5px",
                      fontSize: "14px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      maxWidth: "150px",
                    }}
                  >
                    <option value="" disabled>
                      Select Shot Type
                    </option>
                    {shotTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={addStroke}
          style={{
            padding: "10px 20px",
            margin: "10px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Stroke
        </button>
        <button
          onClick={previousHole}
          disabled={currentHole === 1}
          style={{
            padding: "10px 20px",
            margin: "10px",
            backgroundColor: currentHole === 1 ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: currentHole === 1 ? "not-allowed" : "pointer",
          }}
        >
          Back
        </button>
        <button
          onClick={nextHole}
          style={{
            padding: "10px 20px",
            margin: "10px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {currentHole < 18 ? "Next Hole" : "Finish Game"}
        </button>
        <button
          onClick={goToLeaderboard}
          style={{
            padding: "10px 20px",
            margin: "10px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Game;

// File: src/components/Game.tsx

import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

const discordWebhookUrl = process.env.REACT_APP_DISCORD_WEBHOOK_URL as string;

interface GameProps {
  players: string[];
  strokes: string[][][];
  setStrokes: React.Dispatch<React.SetStateAction<string[][][]>>;
  shotTypes: string[][][];
  setShotTypes: React.Dispatch<React.SetStateAction<string[][][]>>;
  currentHole: number;
  setCurrentHole: React.Dispatch<React.SetStateAction<number>>;
  goToLeaderboard: () => void;
  courseInfo: {
    name: string;
    par: number[];
    yardage: number[];
  };
  sessionName: string;
  sessionToken: string;
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
  sessionName,
  sessionToken,
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

  // Backend sync
  const syncHoleToBackend = async () => {
    const holeData = {
      hole: currentHole,
      strokes: strokes[currentHole - 1] || [],
      shotTypes: shotTypes[currentHole - 1] || [],
    };
    try {
      await fetch(`http://127.0.0.1:8080/sessions/${sessionName}/hole`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify(holeData),
      });
    } catch (err) {
      console.error("Failed to sync hole data:", err);
    }
  };

  const addStroke = () => {
    const updatedStrokes = [...strokes];
    const updatedShotTypes = [...shotTypes];
    if (!updatedStrokes[currentHole - 1]) updatedStrokes[currentHole - 1] = [];
    if (!updatedShotTypes[currentHole - 1]) updatedShotTypes[currentHole - 1] = [];
    updatedStrokes[currentHole - 1].push([]);
    updatedShotTypes[currentHole - 1].push([]);
    setStrokes(updatedStrokes);
    setShotTypes(updatedShotTypes);
    syncHoleToBackend();
  };

  const removeStroke = (idx: number) => {
    const updatedStrokes = [...strokes];
    const updatedShotTypes = [...shotTypes];
    updatedStrokes[currentHole - 1]?.splice(idx, 1);
    updatedShotTypes[currentHole - 1]?.splice(idx, 1);
    setStrokes(updatedStrokes);
    setShotTypes(updatedShotTypes);
    syncHoleToBackend();
  };

  const togglePlayerForStroke = (strokeIdx: number, playerName: string) => {
    const updatedStrokes = [...strokes];
    const currentPlayers = updatedStrokes[currentHole - 1][strokeIdx] || [];
    if (currentPlayers.includes(playerName)) {
      updatedStrokes[currentHole - 1][strokeIdx] = currentPlayers.filter((p) => p !== playerName);
    } else {
      updatedStrokes[currentHole - 1][strokeIdx] = [...currentPlayers, playerName];
    }
    setStrokes(updatedStrokes);
    syncHoleToBackend();
  };

  const selectShotType = (strokeIdx: number, shotType: string) => {
    const updatedShotTypes = [...shotTypes];
    const currentPlayers = strokes[currentHole - 1][strokeIdx] || [];
    if (shotType === "Gimme" || shotType === "Water Hazard") {
      updatedShotTypes[currentHole - 1][strokeIdx] = [shotType];
    } else {
      updatedShotTypes[currentHole - 1][strokeIdx] = currentPlayers.map(() => shotType);
    }
    setShotTypes(updatedShotTypes);
    syncHoleToBackend();
  };

  const nextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
      if (!strokes[currentHole]) setStrokes([...strokes, []]);
      if (!shotTypes[currentHole]) setShotTypes([...shotTypes, []]);
    } else {
      alert("Game Over!");
    }
  };

  const previousHole = () => {
    if (currentHole > 1) setCurrentHole(currentHole - 1);
  };

  const [editablePar, setEditablePar] = useState<number>(courseInfo.par[currentHole - 1]);
  const [editingPar, setEditingPar] = useState<boolean>(false);

  useEffect(() => {
    setEditablePar(courseInfo.par[currentHole - 1]);
    setEditingPar(false);
  }, [currentHole, courseInfo.par]);

  const handleParChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditablePar(Number(e.target.value));
  const savePar = () => {
    const updatedPar = [...courseInfo.par];
    updatedPar[currentHole - 1] = editablePar;
    courseInfo.par = updatedPar;
    setEditingPar(false);
  };

  const exportLeaderboardToDiscord = async () => {
    const leaderboardElement = document.querySelector(".leaderboard-container");
    if (!leaderboardElement) return alert("Leaderboard not found!");
    const canvas = await html2canvas(leaderboardElement as HTMLElement);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return alert("Failed to generate image.");
    const formData = new FormData();
    formData.append("file", blob, "leaderboard.png");
    formData.append("payload_json", JSON.stringify({ content: "Leaderboard export" }));
    await fetch(discordWebhookUrl || "", { method: "POST", body: formData });
    alert("Leaderboard exported to Discord!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Hole {currentHole}</h2>

      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        {editingPar ? (
          <>
            <input type="number" value={editablePar} onChange={handleParChange} style={{ width: "60px" }} />
            <button onClick={savePar} style={{ marginLeft: 8 }}>Save Par</button>
          </>
        ) : (
          <>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>Par: {courseInfo.par[currentHole - 1]}</span>
            <button onClick={() => setEditingPar(true)} style={{ marginLeft: 8 }}>Edit</button>
          </>
        )}
      </div>

      <button
        onClick={addStroke}
        style={{ display: "block", margin: "0 auto 16px", padding: "8px 16px", fontSize: "16px" }}
      >
        Add Stroke
      </button>

      {/* Modern Stroke List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {(strokes[currentHole - 1] || []).map((strokePlayers, idx) => (
          <div
            key={idx}
            style={{
              padding: "12px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>Stroke {idx + 1}</strong>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {players.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlayerForStroke(idx, p)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: strokePlayers.includes(p) ? "#4caf50" : "#f0f0f0",
                    color: strokePlayers.includes(p) ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div>
              <select
                value={(shotTypes[currentHole - 1][idx] || [""])[0]}
                onChange={(e) => selectShotType(idx, e.target.value)}
                style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
              >
                <option value="">-- Shot Type --</option>
                {shotTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => removeStroke(idx)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#e53935",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "24px", textAlign: "center", display: "flex", justifyContent: "center", gap: "12px" }}>
        <button onClick={previousHole} style={{ padding: "8px 16px", borderRadius: "6px" }}>Previous Hole</button>
        <button onClick={nextHole} style={{ padding: "8px 16px", borderRadius: "6px" }}>Next Hole</button>
        <button onClick={goToLeaderboard} style={{ padding: "8px 16px", borderRadius: "6px" }}>Leaderboard</button>
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <button
          onClick={exportLeaderboardToDiscord}
          style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#3b82f6", color: "#fff", border: "none" }}
        >
          Export Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Game;

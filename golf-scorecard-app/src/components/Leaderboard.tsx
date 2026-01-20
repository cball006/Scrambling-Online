import React from "react";
import html2canvas from "html2canvas";

interface LeaderboardProps {
  players: string[];
  strokes: string[][][]; // Tracks selected players for each stroke
  shotTypes: string[][][]; // Tracks shot types for each stroke
  goToGame: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  strokes,
  shotTypes,
  goToGame,
}) => {
  const shotTypeOptions = [
    "Drive",
    "Par 3",
    "Hybrid",
    "Iron",
    "Approach",
    "Chip",
    "Putt",
  ]; // 'Water Hazard' and 'Gimme' are not included

  const calculateScores = () => {
    const scores: { [player: string]: { [shotType: string]: number } } = {};

    // Initialize scores for each player and shot type
    players.forEach((player) => {
      scores[player] = {};
      shotTypeOptions.forEach((shotType) => {
        scores[player][shotType] = 0;
      });
    });

    // Iterate over strokes and shotTypes to calculate scores
    strokes.forEach((hole, holeIndex) => {
      hole.forEach((strokePlayers, strokeIndex) => {
        strokePlayers.forEach((player) => {
          const shotType = shotTypes[holeIndex]?.[strokeIndex]?.[0]; // Get the shot type for this stroke
          if (player && shotType && shotTypeOptions.includes(shotType)) {
            scores[player][shotType] += 1; // Increment the score for the player and shot type
          }
        });
      });
    });

    return scores;
  };

  const scores = calculateScores();

  const getTotalScore = (player: string) =>
    shotTypeOptions.reduce(
      (total, shotType) => total + scores[player][shotType],
      0
    );

  // Sort players by total score in descending order
  const sortedPlayers = [...players].sort(
    (a, b) => getTotalScore(b) - getTotalScore(a)
  );

  const exportLeaderboardToDiscord = async () => {
    // Select only the leaderboard frame (the white card)
    const leaderboardFrame = document.querySelector(".leaderboard-frame");
    if (!leaderboardFrame) {
      alert("Leaderboard frame not found!");
      return;
    }
    const canvas = await html2canvas(leaderboardFrame as HTMLElement);
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

    await fetch(
      process.env.REACT_APP_DISCORD_WEBHOOK_URL || "", // Use the environment variable for the Discord webhook URL
      {
        method: "POST",
        body: formData,
      }
    );
    alert("Leaderboard exported to Discord!");
  };

  return (
    <div
      className="leaderboard-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#e8f5e9",
      }}
    >
      <div
        className="leaderboard-frame"
        style={{
          width: "100%",
          maxWidth: "1200px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#388e3c",
            fontSize: "2.5rem",
            marginBottom: "20px",
          }}
        >
          🏌️‍♂️ Leaderboard ⛳
        </h1>
        <div
          className="table-container"
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            marginBottom: "20px",
          }}
        >
          <table
            style={{
              minWidth: "600px",
              borderCollapse: "collapse",
              width: "100%",
              backgroundColor: "#ffffff",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#388e3c", color: "white" }}>
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Player
                </th>
                {shotTypeOptions.map((shotType) => (
                  <th
                    key={shotType}
                    style={{ padding: "10px", border: "1px solid #ccc" }}
                  >
                    {shotType}
                  </th>
                ))}
                <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => (
                <tr
                  key={player}
                  style={{
                    backgroundColor:
                      sortedPlayers[0] === player ? "#c8e6c9" : "white",
                    fontWeight: sortedPlayers[0] === player ? "bold" : "normal",
                  }}
                >
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {player} {sortedPlayers[0] === player && "🏆"}
                  </td>
                  {shotTypeOptions.map((shotType) => (
                    <td
                      key={shotType}
                      style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {scores[player][shotType]}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      backgroundColor: "#f1f8e9",
                    }}
                  >
                    {getTotalScore(player)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: 24,
          }}
        >
          <button
            onClick={exportLeaderboardToDiscord}
            style={{
              padding: "10px 20px",
              backgroundColor: "#5865F2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Export to Discord
          </button>
          <button
            onClick={goToGame}
            style={{
              padding: "10px 20px",
              backgroundColor: "#388e3c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

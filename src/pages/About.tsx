import React, { useRef, useEffect, useState, useCallback } from 'react';
import "@mdwebb/react-chess/dist/assets/chessground.base.css";
import "@mdwebb/react-chess/dist/assets/chessground.brown.css";
import "@mdwebb/react-chess/dist/assets/chessground.cburnett.css";
import { Chessboard, ChessboardRef } from "@mdwebb/react-chess";
import { Chess } from 'chess.js'; // Import Chess from chess.js

interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
}

interface GameMove {
  pgn: string; // The PGN string for display (e.g., "1. e4", "e5")
  fen: string; // The FEN string *after* this move has been made
  fullMoveNumber: number; // Storing the full move number for clarity
  color: 'w' | 'b'; // Storing the color of the player who made the move
}

const About: React.FC = () => {
  const boardRef = useRef<ChessboardRef>(null);
  const [loadingGame, setLoadingGame] = useState<boolean>(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pgn, setPgn] = useState<string>(""); // The full PGN string of the loaded game
  const [currentFen, setCurrentFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // FEN to control the board
  const [gameMovesHistory, setGameMovesHistory] = useState<GameMove[]>([]); // Stores objects with PGN and FEN
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);

  // Function to load a random game PGN
  const loadRandomGame = async () => {
    setLoadingGame(true);
    setError(null);
    setAnalysis(null);
    setPgn(""); // Clear previous PGN
    setGameMovesHistory([]); // Clear previous move history
    setCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // Reset FEN to initial position

    try {
      const archivesRes = await fetch(
        'https://api.chess.com/pub/player/magnuscarlsen/games/archives'
      );
      if (!archivesRes.ok) throw new Error('Failed to fetch archives');
      const { archives } = await archivesRes.json();
      const randomArchive = archives[Math.floor(Math.random() * archives.length)];
      const gamesRes = await fetch(randomArchive);
      if (!gamesRes.ok) throw new Error('Failed to fetch games');
      const { games } = await gamesRes.json();
      const randomGame = games[Math.floor(Math.random() * games.length)];
      setPgn(randomGame.pgn);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Failed to load game.');
    } finally {
      setLoadingGame(false);
    }
  };

  // Function to navigate to a specific move in the game history
  const goToMove = useCallback((fen: string) => {
    setCurrentFen(fen); // Update the FEN state to trigger board re-render
  }, []);

  // Load a random game on mount
  useEffect(() => {
    loadRandomGame();
  }, []);

  // Effect to parse PGN into individual moves with FENs for navigation
  useEffect(() => {
    if (!pgn) {
      setGameMovesHistory([]);
      return;
    }

    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
      // After loading PGN, set the initial FEN to the start of the game
      setCurrentFen(new Chess().fen()); // Initial FEN before any moves are made
    } catch (e) {
      console.error("Error loading PGN for history:", e);
      setGameMovesHistory([]);
      setCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // Fallback to initial FEN
      return;
    }

    const history = chess.history({ verbose: true }); // Get detailed history
    const movesWithFens: GameMove[] = [];
    const tempChess = new Chess(); // Use a temporary instance to step through moves

    history.forEach((move) => {
      tempChess.move(move); // Apply the move to the temporary board

      // Use the full_move_number and color from the move object for display
      let formattedMove = move.san;
      if (move.color === 'w') {
        // The full move number is the 6th field in a FEN string (0-indexed)
        formattedMove = `${move.after.split(' ')[5]}. ${move.san}`;
      }

      movesWithFens.push({
        pgn: formattedMove,
        fen: tempChess.fen(), // FEN *after* this move
        fullMoveNumber: parseInt(move.after.split(' ')[5]), // Parse the full move number from the FEN
        color: move.color,
      });
    });

    setGameMovesHistory(movesWithFens);
    analyzePosition(); // Re-analyze after new PGN and history are set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgn]); // Only re-run when PGN changes


  // Analyze current board position or PGN using Chess-API.com v1
  const analyzePosition = async () => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysis(null);
    try {
      // Use the currentFen state for analysis, not boardRef.current?.game?.fen()
      // as boardRef.current.game might not be in sync if FEN is controlled by prop
      const payload = currentFen ? { fen: currentFen } : { pgn }; // Prefer FEN for analysis if available
      const res = await fetch('https://chess-api.com/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Analysis API failed: ${res.status}`);
      const data = await res.json();
      console.log('Analysis response:', data);
      const moves: MoveAnalysis[] = Array.isArray(data.moves) ? data.moves : [data];
      setAnalysis(moves);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Analysis failed.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-4xl">About</h1>
          <p className="mb-4">Random Chess.com game with move analysis below.</p>

          {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

          <div className="card mb-6">
            <div className="card-body">
              <div className="flex justify-center">
                <Chessboard
                  ref={boardRef}
                  width={400}
                  height={400}
                  className="rounded-lg"
                  showMoveHistory
                  showNavigation
                  // Pass the currentFen state as the fen prop
                  fen={currentFen}
                  // It's still useful to keep the pgn prop for initial load/full game context
                  // or if the component internally uses it for history traversal.
                  // However, for explicit position setting, 'fen' is king.
                  pgn={pgn} // Keep PGN for the component to build its internal game history
                  onPositionChange={(fen, moves) => {
                    console.log("Current FEN (from onPositionChange):", fen);
                    console.log("Move history (from onPositionChange):", moves);
                    // Optionally, if the user navigates using Chessboard's controls,
                    // you might want to update your currentFen state here to keep it in sync.
                    // setCurrentFen(fen);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={analyzePosition}
              disabled={loadingGame || loadingAnalysis}
              className={`btn btn-success ${loadingGame || loadingAnalysis ? 'btn-disabled' : ''}`}
            >
              {loadingAnalysis ? 'Analyzing...' : 'Re-analyze Position'}
            </button>
            <button
              onClick={loadRandomGame}
              disabled={loadingGame || loadingAnalysis}
              className={`btn btn-primary ${loadingGame ? 'btn-disabled' : ''}`}
            >
              {loadingGame ? 'Fetching Game...' : 'Load New Game'}
            </button>
            <button
              onClick={() => setAnalysis(null)}
              disabled={loadingAnalysis}
              className="btn btn-ghost"
            >
              Clear Analysis
            </button>
          </div>

          {loadingAnalysis && <p className="mb-4">Loading analysis...</p>}

          {/* Display PGN moves with spacing */}
          {gameMovesHistory.length > 0 && (
            <div className="card bg-base-200 p-4 rounded-lg mb-4">
              <h2 className="text-2xl font-semibold mb-2">Game Moves (PGN)</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {gameMovesHistory.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => goToMove(move.fen)} // Pass the FEN to goToMove
                    className="btn btn-sm btn-outline btn-info font-mono text-sm"
                  >
                    {move.pgn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {analysis && (
            <div className="card bg-base-200 p-4 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Analysis</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {analysis.map((m, idx) => (
                  <div key={idx} className="p-2 bg-white rounded shadow text-sm">
                    {m.move && <span className="font-bold mr-1">{m.move}:</span>}
                    <span>Eval {m.evaluation !== undefined ? m.evaluation.toFixed(2) : 'N/A'}</span>
                    {m.best && <span className="ml-2">, best {m.best}</span>}
                    {m.depth !== undefined && <span className="ml-2">, depth {m.depth}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
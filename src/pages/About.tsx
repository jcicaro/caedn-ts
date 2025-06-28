import React, { useRef, useEffect, useState } from 'react';
import "@mdwebb/react-chess/dist/assets/chessground.base.css";
import "@mdwebb/react-chess/dist/assets/chessground.brown.css";
import "@mdwebb/react-chess/dist/assets/chessground.cburnett.css";
import { Chessboard, ChessboardRef } from "@mdwebb/react-chess";

interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
}

const About: React.FC = () => {
  const boardRef = useRef<ChessboardRef>(null);
  const [loadingGame, setLoadingGame] = useState<boolean>(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pgn, setPgn] = useState<string>("");
  const [formattedPgnMoves, setFormattedPgnMoves] = useState<string[]>([]); // New state for individual PGN moves
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);

  // Function to load a random game PGN
  const loadRandomGame = async () => {
    setLoadingGame(true);
    setError(null);
    setAnalysis(null);
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

  // Load a random game on mount
  useEffect(() => {
    loadRandomGame();
  }, []);

  // Automatically analyze once a new PGN is loaded and format moves
  useEffect(() => {
    if (!pgn) return;
    analyzePosition();

    // --- Logic to extract and format PGN moves into an array ---
    const movesOnly = pgn
      .replace(/\[.*?\]|\{.*?\}|\s*\d+\.\.\.|\$\d+|[!?#+=]/g, '') // Remove tags, comments, black move numbers, NAGs, and annotations
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Split by move number (e.g., "1. e4 e5 2. Nf3 Nc6" -> ["1. e4", "e5", "2. Nf3", "Nc6"])
    // This regex matches "NUMBER." or "NUMBER..."
    const individualMoves = movesOnly.split(/(\d+\.\s*(?:\.\.\.)?)/g)
        .filter(segment => segment.trim() !== '') // Remove empty strings
        .reduce((acc: string[], segment, index, array) => {
            if (segment.match(/^\d+\.\s*(\.\.\.)?$/)) { // If it's a move number (e.g., "1." or "1...")
                if (array[index + 1]) { // If there's a next segment (the move itself)
                    acc.push(segment + array[index + 1].trim());
                    // If there's a third segment (Black's move for that turn) and it's not another move number
                    if (array[index + 2] && !array[index + 2].match(/^\d+\.\s*(\.\.\.)?$/)) {
                        acc.push(array[index + 2].trim());
                    }
                }
            } else if (!segment.match(/^\d+\.\s*(\.\.\.)?$/) && segment.trim() !== '') {
                // Handle cases where a move might not immediately follow a number (uncommon, but for robustness)
                // Or if there's an odd number of segments after a split by turn number
                // This typically captures black's move if the reduce didn't already
                if (acc.length > 0 && acc[acc.length -1].startsWith(segment.trim())) {
                  // This condition prevents duplicate additions if Black's move was already added in the if-block
                  // based on the array[index + 2] check.
                  return acc;
                }
                 if (segment.trim() !== '') {
                    // Add segments that are actual moves but not turn numbers, if they haven't been added.
                    // This handles cases like `...e5` not directly following `1.`
                    // Need to be careful not to double add if it was already handled by array[index+2]
                    const lastMoveAdded = acc[acc.length - 1];
                    if (!lastMoveAdded || !lastMoveAdded.includes(segment.trim())) {
                        // This check makes sure we don't re-add black's move if it was already added with the white move
                        acc.push(segment.trim());
                    }
                }
            }
            return acc;
        }, []);

    // A simpler way to clean up the PGN into an array of moves (less robust for every edge case, but often sufficient):
    const simplifiedMoves = pgn
        .replace(/\[.*?\]/g, '') // Remove tags
        .replace(/\{[^}]*\}/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/\d+\.\.\./g, '') // Remove black's move indicators (e.g., "2...")
        .replace(/\s*([!?#+=])\s*/g, '$1') // Remove spaces around annotations
        .trim()
        .split(' ') // Split by space
        .filter(move => move.length > 0 && !/^\d+\.$/.test(move)); // Remove empty strings and standalone move numbers

    // Re-join moves with their numbers for display, if desired, or just keep individual pieces
    // For clean display, we want something like "1. e4", "e5", "2. Nf3", "Nc6"
    let finalMoves: string[] = [];
    const moveRegex = /(\d+\.)(\s*[^\s]+)(\s*[^\s]+)?/g;
    let match;
    let tempPgnForRegex = pgn
        .replace(/\[.*?\]|\{.*?\}|\s*\d+\.\.\.|\$\d+|[!?#+=]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    while ((match = moveRegex.exec(tempPgnForRegex)) !== null) {
        if (match[2]) { // White's move
            finalMoves.push(match[1] + match[2]);
        }
        if (match[3]) { // Black's move
            finalMoves.push(match[3].trim());
        }
    }

    setFormattedPgnMoves(finalMoves);
    // --- End of logic to extract and format moves from PGN ---

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgn]);


  // Analyze current board position or PGN using Chess-API.com v1
  const analyzePosition = async () => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysis(null);
    try {
      const fen = boardRef.current?.game?.fen();
      const payload = fen ? { fen } : { pgn };
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
                  pgn={pgn}
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
          {formattedPgnMoves.length > 0 && (
            <div className="card bg-base-200 p-4 rounded-lg mb-4">
              <h2 className="text-2xl font-semibold mb-2">Game Moves (PGN)</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1"> {/* Added flex and gap for spacing */}
                {formattedPgnMoves.map((move, index) => (
                  <span key={index} className="font-mono text-sm">
                    {move}
                  </span>
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
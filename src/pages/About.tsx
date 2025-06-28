import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import "@mdwebb/react-chess/dist/assets/chessground.base.css";
import "@mdwebb/react-chess/dist/assets/chessground.brown.css";
import "@mdwebb/react-chess/dist/assets/chessground.cburnett.css";
import { Chessboard, ChessboardRef } from "@mdwebb/react-chess";
import { Chess } from 'chess.js';

interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
}

interface GameMove {
  pgn: string;
  fen: string;
  fullMoveNumber: number;
  color: 'w' | 'b';
}

const About: React.FC = () => {
  const boardRef = useRef<ChessboardRef>(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pgn, setPgn] = useState('');
  const [currentFen, setCurrentFen] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [gameMovesHistory, setGameMovesHistory] = useState<GameMove[]>([]);
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);

  // Load a random game PGN
  const loadRandomGame = async () => {
    setLoadingGame(true);
    setError(null);
    setAnalysis(null);
    setPgn('');
    setGameMovesHistory([]);
    setCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

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

  // Navigate to a specific move
  const goToMove = useCallback((fen: string) => {
    setCurrentFen(fen);
  }, []);

  // On mount, load a game
  useEffect(() => {
    loadRandomGame();
  }, []);

  // Parse PGN into move history
  useEffect(() => {
    if (!pgn) {
      setGameMovesHistory([]);
      return;
    }

    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
      setCurrentFen(new Chess().fen());
    } catch (e) {
      console.error('Error loading PGN for history:', e);
      setGameMovesHistory([]);
      setCurrentFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      return;
    }

    const history = chess.history({ verbose: true });
    const tempChess = new Chess();
    const movesWithFens: GameMove[] = history.map(move => {
      tempChess.move(move);
      const fullMoveNumber = Math.floor(tempChess.history().length / 2);
      let formattedSan = move.san;
      if (move.color === 'w') {
        formattedSan = `${fullMoveNumber}. ${move.san}`;
      }
      return {
        pgn: formattedSan,
        fen: tempChess.fen(),
        fullMoveNumber,
        color: move.color,
      };
    });

    setGameMovesHistory(movesWithFens);
    analyzePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgn]);

  // Analyze position or PGN
  const analyzePosition = async () => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysis(null);
    try {
      const payload = currentFen ? { fen: currentFen } : { pgn };
      const res = await fetch('https://chess-api.com/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Analysis API failed: ${res.status}`);
      const data = await res.json();
      const moves: MoveAnalysis[] = Array.isArray(data.moves) ? data.moves : [data];
      setAnalysis(moves);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Analysis failed.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Build rows of white/black move pairs
  const moveRows = useMemo(() => {
    const rows: { moveNumber: number; white?: GameMove; black?: GameMove }[] = [];
    for (let i = 0; i < gameMovesHistory.length; i += 2) {
      rows.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: gameMovesHistory[i],
        black: gameMovesHistory[i + 1],
      });
    }
    return rows;
  }, [gameMovesHistory]);

  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-4xl">About</h1>
          <p className="mb-4">Random Chess.com game with move analysis below.</p>

          {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

          <div className="card mb-6">
            <div className="card-body flex justify-center">
              <Chessboard
                ref={boardRef}
                width={400}
                height={400}
                className="rounded-lg"
                showMoveHistory
                showNavigation
                fen={currentFen}
                pgn={pgn}
                onPositionChange={(fen) => setCurrentFen(fen)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={analyzePosition}
              disabled={loadingGame || loadingAnalysis}
              className={`btn btn-success ${loadingGame || loadingAnalysis ? 'btn-disabled' : ''}`}
            >{loadingAnalysis ? 'Analyzing...' : 'Re-analyze Position'}</button>

            <button
              onClick={loadRandomGame}
              disabled={loadingGame || loadingAnalysis}
              className={`btn btn-primary ${loadingGame ? 'btn-disabled' : ''}`}
            >{loadingGame ? 'Fetching Game...' : 'Load New Game'}</button>

            <button
              onClick={() => setAnalysis(null)}
              disabled={loadingAnalysis}
              className="btn btn-ghost"
            >Clear Analysis</button>
          </div>

          {loadingAnalysis && <p className="mb-4">Loading analysis...</p>}

          {/* Display PGN moves cleanly */}
          {moveRows.length > 0 && (
            <div className="card bg-base-200 p-4 rounded-lg mb-4">
              <h2 className="text-2xl font-semibold mb-2">Game Moves (PGN)</h2>
              <div className="space-y-1 font-mono text-sm">
                {moveRows.map(({ moveNumber, white, black }) => (
                  <div key={moveNumber} className="flex items-center gap-2">
                    <span className="font-bold">{moveNumber}.</span>
                    {white && (
                      <button
                        onClick={() => goToMove(white.fen)}
                        className="btn btn-sm btn-outline btn-info"
                      >{white.pgn.replace(/^\d+\.\s*/, '')}</button>
                    )}
                    {black && (
                      <button
                        onClick={() => goToMove(black.fen)}
                        className="btn btn-sm btn-outline btn-info"
                      >{black.pgn.replace(/^\d+\.\s*/, '')}</button>
                    )}
                  </div>
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

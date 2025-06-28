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

const JcChessTraining: React.FC = () => {
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

  const goToMove = useCallback((fen: string) => {
    setCurrentFen(fen);
  }, []);

  useEffect(() => {
    loadRandomGame();
  }, []);

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
      const fullMoveNumber = Math.floor(tempChess.history().length / 2) + (move.color === 'b' ? 0 : 1);
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
  }, [pgn]);

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
    <div className="flex h-screen">
      {/* Left column: Chessboard */}
      <div className="w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md aspect-square">
          <Chessboard
            id="jcboard"
            ref={boardRef}
            style={{ width: '100%', height: '100%' }}
            className="rounded-lg"
            showNavigation
            fen={currentFen}
            pgn={pgn}
            onPositionChange={(fen) => setCurrentFen(fen)}
          />
        </div>
      </div>

      {/* Right column: Moves & Controls */}
      <div className="w-1/2 overflow-y-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Chess Training with JC</h1>
        <p className="mb-4">Random Chess.com game with move analysis below.</p>

        {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Move List */}
        {moveRows.length > 0 && (
          <div className="mb-6">
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

        {/* Analysis List */}
        {analysis && (
          <div>
            <h2 className="text-2xl font-semibold mb-2">Analysis</h2>
            <div className="space-y-2 text-sm">
              {analysis.map((m, idx) => (
                <div key={idx} className="p-2 bg-gray-100 rounded shadow-sm">
                  {m.move && <span className="font-bold mr-1">{m.move}:</span>}
                  <span>Eval {m.evaluation !== undefined ? m.evaluation.toFixed(2) : 'N/A'}</span>
                  {m.best && <span className="ml-2">best {m.best}</span>}
                  {m.depth !== undefined && <span className="ml-2">depth {m.depth}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JcChessTraining;

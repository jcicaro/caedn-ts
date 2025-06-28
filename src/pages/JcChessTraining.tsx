import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
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
  text?: string; // if your API returns descriptive text
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

  // Analyze the current position by FEN (or fall back to PGN)
  const analyzePosition = useCallback(async () => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysis(null);
    try {
      const payload = currentFen
        ? { fen: currentFen }
        : { pgn };
      const res = await fetch('https://chess-api.com/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Analysis API failed: ${res.status}`);
      const data = await res.json();
      const moves: MoveAnalysis[] = Array.isArray(data.moves)
        ? data.moves
        : [data];
      setAnalysis(moves);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Analysis failed.');
    } finally {
      setLoadingAnalysis(false);
    }
  }, [currentFen, pgn]);

  // Whenever the FEN updates (board move or navigation), re-run analysis
  useEffect(() => {
    if (!loadingGame && !!currentFen) {
      analyzePosition();
    }
  }, [currentFen, loadingGame, analyzePosition]);

  // Parse PGN into move history when it changes
  useEffect(() => {
    if (!pgn) {
      setGameMovesHistory([]);
      return;
    }

    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
      // set currentFen to the final position of the loaded PGN
      setCurrentFen(chess.fen());
    } catch (e) {
      console.error('Error loading PGN for history:', e);
      setGameMovesHistory([]);
      setCurrentFen(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      );
      return;
    }

    const history = chess.history({ verbose: true });
    const tempChess = new Chess();
    const movesWithFens: GameMove[] = history.map(move => {
      tempChess.move(move);
      const fullMoveNumber = Math.ceil(tempChess.history().length / 2);
      const formattedSan =
        move.color === 'w'
          ? `${fullMoveNumber}. ${move.san}`
          : move.san;
      return {
        pgn: formattedSan,
        fen: tempChess.fen(),
        fullMoveNumber,
        color: move.color,
      };
    });
    setGameMovesHistory(movesWithFens);
  }, [pgn]);

  // Navigate to a specific move
  const goToMove = useCallback((fen: string) => {
    setCurrentFen(fen);
  }, []);

  // On mount, load a game
  useEffect(() => {
    loadRandomGame();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body flex flex-col items-center">
          <h1 className="card-title text-4xl">Chess Training with JC</h1>
          <p className="mb-4 text-center">
            Random Chess.com game with move analysis below.
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center mb-4">
            <Chessboard
              id="jcboard"
              ref={boardRef}
              width={400}
              height={400}
              className="rounded-lg"
              showNavigation
              fen={currentFen}
              pgn={pgn}
              onPositionChange={fen => setCurrentFen(fen)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <button
              onClick={analyzePosition}
              disabled={loadingGame || loadingAnalysis}
              className={`btn btn-success btn-sm ${
                loadingGame || loadingAnalysis ? 'btn-disabled' : ''
              }`}
            >
              {loadingAnalysis ? 'Analyzing...' : 'Re-analyze'}
            </button>
            <button
              onClick={loadRandomGame}
              disabled={loadingGame || loadingAnalysis}
              className={`btn btn-primary btn-sm ${
                loadingGame ? 'btn-disabled' : ''
              }`}
            >
              {loadingGame ? 'Fetching...' : 'New Game'}
            </button>
            <button
              onClick={() => setAnalysis(null)}
              disabled={loadingAnalysis}
              className="btn btn-ghost btn-sm"
            >
              Clear Analysis
            </button>
          </div>

          {false && gameMovesHistory.length > 0 && (
            <div className="w-full bg-base-200 p-2 rounded-lg mb-4 text-xs font-mono">
              <div className="inline-flex items-baseline flex-wrap gap-1">
                {gameMovesHistory.map((move, idx) => (
                  <React.Fragment key={idx}>
                    {move.color === 'w' && (
                      <span className="font-bold mr-0.5">
                        {move.fullMoveNumber}.
                      </span>
                    )}
                    <button
                      onClick={() => goToMove(move.fen)}
                      className="btn btn-ghost btn-xs py-0 px-1 align-baseline"
                    >
                      {move.pgn.replace(/^\d+\.\s*/, '')}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {analysis && (
            <div className="w-full bg-base-200 p-4 rounded-lg">
              <h2 className="text-2xl font-semibold mb-2">Analysis</h2>
              <div className="flex flex-wrap gap-2 text-sm">
                {analysis.map((m, i) => (
                  <div key={i} className="p-2 bg-white rounded shadow">
                    {m.move && (
                      <span className="font-bold mr-1">{m.move}:</span>
                    )}
                    <span>{m.text ?? m.evaluation?.toFixed(2)}</span>
                    {m.best && <span className="ml-2">best {m.best}</span>}
                    {/* {m.depth !== undefined && (
                      <span className="ml-2">depth {m.depth}</span>
                    )} */}
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

export default JcChessTraining;

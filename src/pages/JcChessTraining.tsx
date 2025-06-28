// src/pages/JcChessTraining.tsx
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

// Chat UI pieces
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
  text?: string;
}

interface GameMove {
  pgn: string;
  fen: string;
  fullMoveNumber: number;
  color: 'w' | 'b';
}

const JcChessTraining: React.FC = () => {
  // --- Chat setup ---
  const INITIAL_PROMPT = `
Your name is ChessBuddy.
Whenever I give you a list of moves and evaluations, explain what’s happening in simple terms.
  `.trim();

  const {
    messages,
    loading: chatLoading,
    error: chatError,
    send: sendToChat,
  } = useChat(INITIAL_PROMPT, import.meta.env.VITE_OPENAI_MODEL);

  // --- Chess & analysis state ---
  const boardRef = useRef<ChessboardRef>(null);

  const [loadingGame, setLoadingGame] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pgn, setPgn] = useState('');
  const [gameMovesHistory, setGameMovesHistory] = useState<GameMove[]>([]);
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);

  // helper to read the current FEN from the board instance
  const getBoardFen = useCallback((): string => {
    if (!boardRef.current) return '';
    if (typeof boardRef.current.getPosition === 'function') {
      return boardRef.current.getPosition();
    }
    if (boardRef.current.api?.getPosition) {
      return boardRef.current.api.getPosition();
    }
    return '';
  }, []);

  // --- Load a random Magnus Carlsen game ---
  const loadRandomGame = async () => {
    setLoadingGame(true);
    setError(null);
    setAnalysis(null);
    setPgn('');
    setGameMovesHistory([]);

    try {
      const archivesRes = await fetch(
        'https://api.chess.com/pub/player/magnuscarlsen/games/archives'
      );
      if (!archivesRes.ok) throw new Error('Failed to fetch archives');
      const { archives } = await archivesRes.json();
      const randomArchive =
        archives[Math.floor(Math.random() * archives.length)];
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

  // --- Analyze & store in state (manual only) ---
  const analyzePosition = useCallback(async () => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysis(null);

    try {
      const fen = getBoardFen();
      const payload = fen
        ? { fen }
        : { input: pgn };    // use `input` instead of `pgn` for PGN payload
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
  }, [pgn, getBoardFen]);

  // --- Parse PGN into move history (no auto-analysis) ---
  useEffect(() => {
    if (!pgn) {
      setGameMovesHistory([]);
      return;
    }

    const chess = new Chess();
    chess.loadPgn(pgn);

    const history = chess.history({ verbose: true });
    const tempChess = new Chess();
    const movesWithFens = history.map(move => {
      tempChess.move(move);
      const fullMoveNumber = Math.ceil(tempChess.history().length / 2);
      const formattedSan =
        move.color === 'w' ? `${fullMoveNumber}. ${move.san}` : move.san;
      return {
        pgn: formattedSan,
        fen: tempChess.fen(),
        fullMoveNumber,
        color: move.color,
      };
    });

    setGameMovesHistory(movesWithFens);
  }, [pgn]);

  // --- Send analysis into chat on demand ---
  const sendAnalysisToChat = useCallback(() => {
    if (!analysis?.length) return;
    const text = analysis
      .map(m =>
        m.move
          ? `${m.move}: ${m.text ?? m.evaluation?.toFixed(2)}${
              m.best ? ` (best: ${m.best})` : ''
            }`
          : ''
      )
      .join('\n');
    sendToChat(text);
  }, [analysis, sendToChat]);

  // --- Jump to a specific move FEN via board API ---
  const goToMove = useCallback((fen: string) => {
    if (!boardRef.current) return;
    if (typeof boardRef.current.set === 'function') {
      boardRef.current.set({ fen });
    } else if (boardRef.current.api?.setPosition) {
      boardRef.current.api.setPosition(fen);
    }
  }, []);

  // --- On mount, load a game ---
  useEffect(() => {
    loadRandomGame();
  }, []);

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* ==== Chessboard & Controls ==== */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body flex flex-col items-center">
          <h1 className="card-title text-4xl">Chess Training with JC</h1>
          <p className="mb-4 text-center">
            Random Chess.com game — click “Re-analyze” when you want fresh analysis.
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
              showNavigation  // PGN-driven navigation arrows
              pgn={pgn}        // board driven only by PGN
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
            <button
              onClick={sendAnalysisToChat}
              disabled={!analysis?.length || chatLoading}
              className="btn btn-info btn-sm"
            >
              Send to Chat
            </button>
          </div>

          {gameMovesHistory.length > 0 && (
            <div className="w-full bg-base-200 p-2 rounded-lg mb-4 text-xs font-mono overflow-x-auto">
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==== Chat Coach ==== */}
      <div className="card bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Coach Chat</h2>
        <ul className="chat flex flex-col space-y-2 mb-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {chatLoading && (
            <li className="flex items-center justify-center h-12">
              <div className="chat-bubble loading">...</div>
            </li>
          )}
        </ul>
        <ChatInput onSend={sendToChat} disabled={chatLoading} />
        {chatError && <div className="text-red-500 mt-2">{chatError}</div>}
      </div>
    </div>
  );
};

export default JcChessTraining;

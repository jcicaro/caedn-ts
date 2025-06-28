// src/pages/JcChessTraining.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import "@mdwebb/react-chess/dist/assets/chessground.base.css";
import "@mdwebb/react-chess/dist/assets/chessground.brown.css";
import "@mdwebb/react-chess/dist/assets/chessground.cburnett.css";
import { Chessboard, ChessboardRef } from "@mdwebb/react-chess";

import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
  text?: string;
  continuation?: Array<Object>;
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------
const INITIAL_PROMPT = `
Your name is ChessBuddy.
Whenever I give you a board position and analysis, explain it in simple terms.
`.trim();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------
const JcChessTraining: React.FC = () => {
  const boardRef = useRef<ChessboardRef>(null);

  // State ------------------------------------------------------------------
  const [pgn,         setPgn]         = useState("");
  const [currentFen,  setCurrentFen]  = useState("");
  const [analysis,    setAnalysis]    = useState<MoveAnalysis[] | null>(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [loadingAn,   setLoadingAn]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const {
    messages,
    loading: chatLoading,
    error:   chatError,
    send:    sendToChat,
  } = useChat(INITIAL_PROMPT, import.meta.env.VITE_OPENAI_MODEL);

  // Helpers ---------------------------------------------------------------
  const normalize = (raw: any): MoveAnalysis => ({
    move:       raw.move     ?? raw.san ?? raw.lan,
    evaluation: raw.eval     ?? raw.evaluation,
    best:       raw.bestmove ?? raw.best ?? raw.bestMove,
    depth:      raw.depth,
    text:       raw.text     ?? raw.comment,
    continuation: raw.continuation
  });

  // Load a random Magnus Carlsen game -------------------------------------
  const loadRandomGame = useCallback(async () => {
    setLoadingGame(true);
    setError(null);
    setAnalysis(null);
    setPgn("");
    setCurrentFen("");

    try {
      const archivesRes = await fetch(
        "https://api.chess.com/pub/player/magnuscarlsen/games/archives"
      );
      if (!archivesRes.ok) throw new Error("Failed to fetch archives");
      const { archives } = await archivesRes.json();

      const randomArchive = archives[Math.floor(Math.random() * archives.length)];
      const gamesRes      = await fetch(randomArchive);
      if (!gamesRes.ok) throw new Error("Failed to fetch games");
      const { games }     = await gamesRes.json();
      const randomGame    = games[Math.floor(Math.random() * games.length)];

      setPgn(randomGame.pgn); // board renders, hook below sets FEN
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingGame(false);
    }
  }, []);

  // Analyse current position ----------------------------------------------
  const analyzePosition = useCallback(async () => {
    if (!currentFen) {
      setError("Position not ready. Try again in a moment.");
      return;
    }
    setLoadingAn(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: currentFen }),
      });
      if (!res.ok) throw new Error(`Analysis API failed (${res.status})`);
      const data = await res.json();

      console.log('analyzePosition', data);

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.moves)
        ? data.moves
        : [data];

      setAnalysis(arr.map(normalize));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingAn(false);
    }
  }, [currentFen]);

  // Send analysis to chat --------------------------------------------------
  const sendAnalysisToChat = useCallback(() => {
    if (!analysis?.length) return;
    // const txt = analysis
    //   .map(m => {
    //     const parts: string[] = [];
    //     if (m.move) parts.push(m.move);
    //     if (m.text) parts.push(m.text);
    //     else if (m.evaluation !== undefined)
    //       parts.push(`Eval ${m.evaluation.toFixed(2)}`);
    //     if (m.best) parts.push(`best ${m.best}`);
    //     return parts.join(" – ");
    //   })
    //   .join("\n");
    // console.log('sendAnalysisToChat', txt, analysis);
    // sendToChat(txt);
    sendToChat(JSON.stringify(analysis));
  }, [analysis, sendToChat]);

  // ------------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------------

  // 1. Load a random game on mount
  useEffect(() => { loadRandomGame(); }, [loadRandomGame]);

  // 2. Parse PGN → final FEN so Analyse works immediately
  useEffect(() => {
    if (!pgn) return;
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
      setCurrentFen(chess.fen());      // final position
    } catch (err) {
      console.error("PGN parse failed", err);
    }
  }, [pgn]);

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------
  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Chessboard card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body flex flex-col items-center">
          <h1 className="card-title text-4xl">Chess Training with JC</h1>
          <p className="mb-4 text-center">
            Random Chess.com game — navigate and click Analyse.
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center mb-4">
            <Chessboard
              id="jc-board"
              ref={boardRef}
              width={400}
              height={400}
              className="rounded-lg"
              showNavigation
              pgn={pgn}
              onPositionChange={fen => setCurrentFen(fen)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <button
              onClick={analyzePosition}
              disabled={loadingGame || loadingAn}
              className={`btn btn-success btn-sm ${
                loadingGame || loadingAn ? "btn-disabled" : ""
              }`}
            >
              {loadingAn ? "Analysing…" : "Analyse"}
            </button>

            <button
              onClick={loadRandomGame}
              disabled={loadingGame || loadingAn}
              className={`btn btn-primary btn-sm ${
                loadingGame ? "btn-disabled" : ""
              }`}
            >
              {loadingGame ? "Fetching…" : "New Game"}
            </button>

            <button
              onClick={() => setAnalysis(null)}
              disabled={loadingAn}
              className="btn btn-ghost btn-sm"
            >
              Clear
            </button>

            <button
              onClick={sendAnalysisToChat}
              disabled={!analysis?.length || chatLoading}
              className="btn btn-info btn-sm"
            >
              Send to Chat
            </button>
          </div>

          {analysis?.length && (
            <div className="w-full bg-base-200 p-4 rounded-lg">
              <h2 className="text-2xl font-semibold mb-2">Analysis</h2>
              <div className="flex flex-col gap-2 text-sm">
                {analysis.map((m, i) => (
                  <div
                    key={i}
                    className="p-2 bg-white rounded shadow break-words"
                  >
                    {m.move && (
                      <span className="font-bold mr-1">{m.move}:</span>
                    )}
                    <span>
                      {m.text ??
                        (m.evaluation !== undefined
                          ? m.evaluation.toFixed(2)
                          : "…")}
                    </span>
                    {m.best && <span className="ml-2">best {m.best}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Coach */}
      <div className="card bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Coach Chat</h2>
        <ul className="chat flex flex-col space-y-2 mb-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {chatLoading && (
            <li className="flex items-center justify-center h-12">
              <div className="chat-bubble loading">…</div>
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

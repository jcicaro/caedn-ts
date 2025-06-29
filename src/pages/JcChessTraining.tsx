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
  fen?: string;
  continuation?: Array<object>;
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------
const INITIAL_PROMPT = `Your name is ChessBuddy.
When I ask for an analysis, tell me whether it's White or Black's turn.
Whenever I give you a board position and analysis, explain it in simple terms that a 6 year old can understand.
Unless I specify, the "move" I mention is the best next move the AI has determined.
If you're unsure what piece is currently on the position, just mention "piece" instead of guessing.
When there's a continuation array, it is showing the next two most likely moves after the suggested best move.
When giving the board position, explain it into something easily understood instead of giving in FEN format.
Add some emojis to make it more visual.
Do not mention anything about the depth.`;

// Helper for CSS custom props
const cssVar = (name: string, value: string) =>
  ({ [name]: value } as React.CSSProperties);

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------
const JcChessTraining: React.FC = () => {
  const boardRef = useRef<ChessboardRef>(null);

  // ----------------------------------------------------------------------
  // State
  // ----------------------------------------------------------------------
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedGameUrl, setSelectedGameUrl] = useState<string>("");
  const [pgn, setPgn] = useState<string>("");
  const [currentFen, setCurrentFen] = useState<string>("");
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);
  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [loadingAn, setLoadingAn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showPgnModal, setShowPgnModal] = useState<boolean>(false);   // view-only modal
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false); // new load-PGN modal
  const [loadPgnText, setLoadPgnText] = useState<string>("");

  const {
    messages,
    loading: chatLoading,
    error: chatError,
    send: sendToChat,
  } = useChat(INITIAL_PROMPT, import.meta.env.VITE_OPENAI_MODEL);

  // ----------------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------------
  const normalize = (raw: any): MoveAnalysis => ({
    move: raw.move ?? raw.san ?? raw.lan,
    evaluation: raw.eval ?? raw.evaluation,
    best: raw.bestmove ?? raw.best ?? raw.bestMove,
    depth: raw.depth,
    text: raw.text ?? raw.comment,
    continuation: raw.continuation,
    fen: raw.fen,
  });

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch((err) => console.error("Async copy failed", err));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  // ----------------------------------------------------------------------
  // Responsive board size
  // ----------------------------------------------------------------------
  const [boardSize, setBoardSize] = useState<number>(360);
  useEffect(() => {
    const calc = () => {
      const max = Math.min(360, window.innerWidth - 48);
      setBoardSize(max < 240 ? 240 : max);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // ----------------------------------------------------------------------
  // Fetch Magnus Carlsen's games (last 3 months)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const loadGames = async () => {
      setLoadingGames(true);
      setError(null);
      try {
        const archivesRes = await fetch(
          "https://api.chess.com/pub/player/magnuscarlsen/games/archives",
        );
        if (!archivesRes.ok) throw new Error("Failed to fetch archives");
        const { archives } = await archivesRes.json();

        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);

        const collected: any[] = [];
        for (const url of archives.slice().reverse()) {
          const parts = url.split("/");
          const year = parseInt(parts[parts.length - 2], 10);
          const month = parseInt(parts[parts.length - 1], 10) - 1;
          const archiveDate = new Date(year, month, 1);
          if (archiveDate < cutoffDate) break;
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const { games } = await res.json();
            collected.push(...games);
          } catch {
            continue;
          }
        }
        // fallback: latest archive if none in window
        if (collected.length === 0 && archives.length > 0) {
          const latest = archives[archives.length - 1];
          const res = await fetch(latest);
          if (res.ok) {
            const { games } = await res.json();
            collected.push(...games);
          }
        }

        setGamesList(collected);
        if (collected.length) {
          setSelectedGameUrl(collected[0].url);
          setPgn(collected[0].pgn);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingGames(false);
      }
    };
    loadGames();
  }, []);

  // ----------------------------------------------------------------------
  // Game selection & PGN handling
  // ----------------------------------------------------------------------
  const filteredGames = gamesList.filter((g) => {
    const opponent =
      g.white?.username?.toLowerCase() === "magnuscarlsen" ? g.black.username : g.white.username;
    const label = `${new Date(g.end_time * 1000).toLocaleDateString()} vs ${opponent}`;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectGame = (url: string) => {
    const game = gamesList.find((g) => g.url === url);
    if (game) {
      setSelectedGameUrl(url);
      setPgn(game.pgn);
    }
  };

  // update board FEN when pgn changes
  useEffect(() => {
    if (!pgn) return;
    const c = new Chess();
    c.loadPgn(pgn);
    setCurrentFen(c.fen());
  }, [pgn]);

  // ----------------------------------------------------------------------
  // Analysis
  // ----------------------------------------------------------------------
  const analyzePosition = useCallback(async () => {
    if (!currentFen) {
      setError("Position not ready.");
      return;
    }
    setLoadingAn(true);
    setError(null);
    try {
      const res = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: currentFen }),
      });
      if (!res.ok) throw new Error(`Analysis API failed (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.moves)
        ? data.moves
        : [data];
      setAnalysis(arr.map(normalize));
      sendToChat(JSON.stringify(arr.map(normalize)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAn(false);
    }
  }, [currentFen, sendToChat]);

  // ----------------------------------------------------------------------
  // NEW: Load PGN handler
  // ----------------------------------------------------------------------
  const handleLoadPgn = () => {
    if (!loadPgnText.trim()) return;
    setPgn(loadPgnText.trim());
    setSelectedGameUrl("");       // clear game selection so dropdown doesn't look out-of-sync
    setShowLoadModal(false);
    setLoadPgnText("");
  };

  // ----------------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------------
  return (
    <div className="h-screen md:flex md:items-start gap-4 p-4 bg-base-200">
      {/* Board & Selector */}
      <div className="md:w-1/2 lg:w-2/5 flex-shrink-0 md:sticky md:top-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body flex flex-col items-center">
            <h1 className="card-title text-3xl text-center">Chess Buddy</h1>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {/* search + dropdown */}
            <div className="mb-4 w-full">
              <input
                type="text"
                placeholder="Search games…"
                className="input input-bordered w-full mb-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loadingGames}
              />
              <select
                className="select select-bordered w-full"
                value={selectedGameUrl}
                onChange={(e) => handleSelectGame(e.target.value)}
                disabled={loadingGames}
              >
                {filteredGames.length ? (
                  filteredGames.map((g) => {
                    const opponent =
                      g.white.username.toLowerCase() === "magnuscarlsen"
                        ? g.black.username
                        : g.white.username;
                    const label = `${new Date(g.end_time * 1000).toLocaleDateString()} vs ${opponent}`;
                    return (
                      <option key={g.url} value={g.url}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <option disabled>No games available</option>
                )}
              </select>
            </div>

            {/* board */}
            <div className="flex justify-center mb-4 w-full">
              <Chessboard
                ref={boardRef}
                width={boardSize}
                height={boardSize}
                className="rounded-lg"
                showNavigation
                pgn={pgn}
                onPositionChange={(fen) => setCurrentFen(fen)}
              />
            </div>

            {/* action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={analyzePosition}
                disabled={!currentFen || loadingAn}
                className="btn btn-success btn-sm"
              >
                {loadingAn ? "Analysing…" : "Analyse"}
              </button>

              {/* NEW Load PGN button */}
              <button
                onClick={() => setShowLoadModal(true)}
                className="btn btn-primary btn-sm"
              >
                Load PGN
              </button>

              <button
                onClick={() => setShowPgnModal(true)}
                disabled={!pgn}
                className="btn btn-secondary btn-sm"
              >
                Show PGN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="mt-4 md:mt-0 flex-1 flex flex-col h-[70vh] md:h-screen">
        <div className="card bg-base-100 shadow-xl flex-1 overflow-hidden">
          <div className="card-body p-4 flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Coach Chat</h2>
            <ul
              className="chat flex-1 overflow-y-auto space-y-2 pr-2 break-all"
              style={cssVar("--chat-bubble-max-width", "95%")}
            >
              {messages.map((m, i) => (
                <ChatBubble key={i} msg={m} />
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
      </div>

      {/* View-only PGN Modal */}
      <div
        className={`modal ${showPgnModal ? "modal-open" : ""}`}
        onClick={(e) => e.currentTarget === e.target && setShowPgnModal(false)}
      >
        <div className="modal-box relative">
          <button
            onClick={() => setShowPgnModal(false)}
            className="btn btn-xs btn-circle absolute right-2 top-2"
          >
            ✕
          </button>
          <h3 className="font-bold text-lg">Game PGN</h3>
          <pre className="whitespace-pre-wrap my-4">{pgn}</pre>
          <div className="modal-action">
            <button onClick={() => copyToClipboard(pgn)} className="btn btn-outline btn-sm">
              Copy PGN
            </button>
          </div>
        </div>
      </div>

      {/* NEW Load-PGN Modal */}
      <div
        className={`modal ${showLoadModal ? "modal-open" : ""}`}
        onClick={(e) => e.currentTarget === e.target && setShowLoadModal(false)}
      >
        <div className="modal-box relative">
          <button
            onClick={() => setShowLoadModal(false)}
            className="btn btn-xs btn-circle absolute right-2 top-2"
          >
            ✕
          </button>
          <h3 className="font-bold text-lg">Paste a PGN</h3>

          <textarea
            className="textarea textarea-bordered w-full h-40 mt-4"
            placeholder="Paste PGN here…"
            value={loadPgnText}
            onChange={(e) => setLoadPgnText(e.target.value)}
          />

          <div className="modal-action">
            <button
              onClick={handleLoadPgn}
              disabled={!loadPgnText.trim()}
              className="btn btn-primary btn-sm"
            >
              Load
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JcChessTraining;

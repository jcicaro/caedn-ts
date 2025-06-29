import React, { useRef, useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import "@mdwebb/react-chess/dist/assets/chessground.base.css";
import "@mdwebb/react-chess/dist/assets/chessground.brown.css";
import "@mdwebb/react-chess/dist/assets/chessground.cburnett.css";
import { Chessboard, ChessboardRef } from "@mdwebb/react-chess";

import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

/* --------------------------------------------------------------------- */
/* Types                                                                 */
/* --------------------------------------------------------------------- */
interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
  text?: string;
  fen?: string;
  continuation?: Array<object>;
}
interface PgnMeta {
  white?: string;
  black?: string;
  result?: string;
}

/* --------------------------------------------------------------------- */
/* Constants                                                             */
/* --------------------------------------------------------------------- */
const INITIAL_PROMPT = `Your name is ChessBuddy.
When I ask for an analysis, tell me whether it's White or Black's turn.
Whenever I give you a board position and analysis, explain it in simple terms that a 6 year old can understand.
Unless I specify, the "move" I mention is the best next move the AI has determined.
If you're unsure what piece is currently on the position, just mention "piece" instead of guessing.
When there's a continuation array, it is showing the next two most likely moves after the suggested best move.
When giving the board position, explain it into something easily understood instead of giving in FEN format.
Add some emojis to make it more visual.
Do not mention anything about the depth.`;

/* --------------------------------------------------------------------- */
/* Utility helpers                                                       */
/* --------------------------------------------------------------------- */
const cssVar = (name: string, value: string) =>
  ({ [name]: value } as React.CSSProperties);

const extractTag = (tag: string, pgn: string) => {
  const m = pgn.match(new RegExp(`\\[${tag}\\s+"([^"]+)"\\]`, "i"));
  return m ? m[1] : undefined;
};

const getTurnFromFen = (fen: string): "w" | "b" | null => {
  const p = fen.split(" ");
  return p[1] === "w" || p[1] === "b" ? (p[1] as "w" | "b") : null;
};

/* --------------------------------------------------------------------- */
/* Component                                                             */
/* --------------------------------------------------------------------- */
const JcChessTraining: React.FC = () => {
  /* refs & state ------------------------------------------------------ */
  const boardRef = useRef<ChessboardRef>(null);

  const [gamesList, setGamesList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGameUrl, setSelectedGameUrl] = useState("");
  const [pgn, setPgn] = useState("");
  const [currentFen, setCurrentFen] = useState("");
  const [currentTurn, setCurrentTurn] = useState<"w" | "b" | null>(null);
  const [pgnMeta, setPgnMeta] = useState<PgnMeta>({});
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingAn, setLoadingAn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPgnModal, setShowPgnModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadPgnText, setLoadPgnText] = useState("");

  const { messages, loading: chatLoading, error: chatError, send: sendToChat } =
    useChat(INITIAL_PROMPT, import.meta.env.VITE_OPENAI_MODEL);

  /* responsive board size -------------------------------------------- */
  const [boardSize, setBoardSize] = useState(360);
  useEffect(() => {
    const calc = () => {
      const max = Math.min(360, window.innerWidth - 48);
      setBoardSize(max < 240 ? 240 : max);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  /* fetch recent Magnus Carlsen games -------------------------------- */
  useEffect(() => {
    const loadGames = async () => {
      setLoadingGames(true);
      setError(null);
      try {
        const arcRes = await fetch(
          "https://api.chess.com/pub/player/magnuscarlsen/games/archives",
        );
        if (!arcRes.ok) throw new Error("Failed to fetch archives");
        const { archives } = await arcRes.json();

        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3);

        const collected: any[] = [];
        for (const url of archives.slice().reverse()) {
          const [year, month] = url.split("/").slice(-2).map(Number);
          if (new Date(year, month - 1, 1) < cutoff) break;
          try {
            const res = await fetch(url);
            if (res.ok) collected.push(...(await res.json()).games);
          } catch {/* ignore */ }
        }
        if (!collected.length && archives.length) {
          const res = await fetch(archives.at(-1)!);
          if (res.ok) collected.push(...(await res.json()).games);
        }

        setGamesList(collected);
        if (collected[0]) {
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

  /* PGN → meta, FEN, turn ------------------------------------------- */
  useEffect(() => {
    if (!pgn) {
      setCurrentFen("");
      setCurrentTurn(null);
      setPgnMeta({});
      return;
    }

    // — meta via RegEx (always works) —
    setPgnMeta({
      white: extractTag("White", pgn),
      black: extractTag("Black", pgn),
      result: extractTag("Result", pgn),
    });

    // — try chess.js, sloppy mode —
    let fen = "";
    let turn: "w" | "b" | null = null;
    try {
      const c = new Chess();
      (c as any).loadPgn?.(pgn, { sloppy: true }) ??
        (c as any).load_pgn?.(pgn, { sloppy: true });
      fen = c.fen();
      turn = c.turn();
    } catch {/* ignore parse errors */ }

    // — fallback [FEN "…"] tag —
    if (!fen) {
      const m = pgn.match(/\[FEN\s+"([^"]+)"/i);
      if (m) {
        fen = m[1];
        turn = getTurnFromFen(m[1]);
      }
    }

    // — final fallback: standard start position —
    if (!fen) {
      fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      turn = "w";
    }

    setCurrentFen(fen);
    setCurrentTurn(turn);
  }, [pgn]);

  /* helpers ---------------------------------------------------------- */
  const normalize = (raw: any): MoveAnalysis => ({
    move: raw.move ?? raw.san ?? raw.lan,
    evaluation: raw.eval ?? raw.evaluation,
    best: raw.bestmove ?? raw.best ?? raw.bestMove,
    depth: raw.depth,
    text: raw.text ?? raw.comment,
    continuation: raw.continuation,
    fen: raw.fen,
  });

  // const copyToClipboard = (text: string) =>
  //   navigator.clipboard?.writeText(text).catch(console.error);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(console.error);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Was not possible to copy text: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  /* game selection --------------------------------------------------- */
  const filteredGames = gamesList.filter((g) => {
    const opp = g.white.username.toLowerCase() === "magnuscarlsen"
      ? g.black.username
      : g.white.username;
    const label = `${new Date(g.end_time * 1000).toLocaleDateString()} vs ${opp}`;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectGame = (url: string) => {
    const g = gamesList.find((x) => x.url === url);
    if (g) {
      setSelectedGameUrl(url);
      setPgn(g.pgn);
    }
  };

  /* board navigation – update turn badge ---------------------------- */
  const handlePositionChange = (fen: string) => {
    setCurrentFen(fen);
    setCurrentTurn(getTurnFromFen(fen));
  };

  /* analyse ---------------------------------------------------------- */
  const analyse = useCallback(async () => {
    if (!currentFen) return;
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
        : Array.isArray(data.moves) ? data.moves : [data];
      setAnalysis(arr.map(normalize));
      sendToChat(JSON.stringify(arr.map(normalize)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAn(false);
    }
  }, [currentFen, sendToChat]);

  /* manual PGN load -------------------------------------------------- */
  const handleLoadPgn = () => {
    if (!loadPgnText.trim()) return;
    setPgn(loadPgnText.trim());
    setSelectedGameUrl("");
    setShowLoadModal(false);
    setLoadPgnText("");
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="h-screen md:flex md:items-start gap-4 p-4 bg-base-200">
      {/* board column */}
      <div className="md:w-1/2 lg:w-2/5 flex-shrink-0 md:sticky md:top-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body flex flex-col items-center">
            <h1 className="card-title text-3xl text-center">Chess Buddy</h1>

            {/* PGN summary */}
            <p className="text-sm opacity-80 text-center mb-2">
              White: <span className="font-semibold">{pgnMeta.white || "—"}</span> |
              {" "}Black: <span className="font-semibold">{pgnMeta.black || "—"}</span> |
              {" "}Result: <span className="font-semibold">{pgnMeta.result || "—"}</span>
            </p>

            {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

            {/* search + dropdown */}
            <div className="mb-4 w-full">
              <input
                className="input input-bordered w-full mb-2"
                placeholder="Search games…"
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
                    const opp = g.white.username.toLowerCase() === "magnuscarlsen"
                      ? g.black.username
                      : g.white.username;
                    const label = `${new Date(g.end_time * 1000).toLocaleDateString()} vs ${opp}`;
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

            {/* turn badge */}
            {currentTurn && (
              <div className="badge badge-info mb-2">
                {currentTurn === "w" ? "White to move ⬜" : "Black to move ⬛"}
              </div>
            )}

            {/* board */}
            <div className="flex justify-center mb-4 w-full">
              <Chessboard
                ref={boardRef}
                width={boardSize}
                height={boardSize}
                className="rounded-lg"
                showNavigation
                pgn={pgn}
                onPositionChange={handlePositionChange}
              />
            </div>

            {/* buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={analyse}
                disabled={!currentFen || loadingAn}
                className="btn btn-success btn-sm"
              >
                {loadingAn ? "Analysing…" : "Analyse"}
              </button>
              <button onClick={() => setShowLoadModal(true)} className="btn btn-primary btn-sm">
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

      {/* chat column */}
      <div className="mt-4 md:mt-0 flex-1 flex flex-col h-[70vh] md:h-screen">
        <div className="card bg-base-100 shadow-xl flex-1 overflow-hidden">
          <div className="card-body p-4 flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Coach Chat</h2>
            <ul
              className="chat flex-1 overflow-y-auto space-y-2 pr-2 break-all"
              style={cssVar("--chat-bubble-max-width", "95%")}
            >
              {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
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

      {/* show PGN modal */}
      <div
        className={`modal ${showPgnModal ? "modal-open" : ""}`}
        onClick={(e) => e.currentTarget === e.target && setShowPgnModal(false)}
      >
        <div className="modal-box relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Game PGN</h3>
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(pgn)} className="btn btn-outline btn-xs">
                Copy PGN
              </button>
              <button onClick={() => setShowPgnModal(false)} className="btn btn-xs btn-circle">
                ✕
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap h-72 overflow-y-auto">{pgn}</pre>
        </div>
      </div>

      {/* load PGN modal */}
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



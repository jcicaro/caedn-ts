import React from "react";
import { Chessboard } from "@mdwebb/react-chess";
// import ChessGameSelector from "./ChessGameSelector";
// import { ChessTurnBadge } from "./ChessTurnBadge";
// import { ChessAnalysisControls } from "./ChessAnalysisControls";
import type { PgnMeta } from "../types/chess";
import { extractTag } from "../utils/chess";

interface Props {
  boardSize: number;
  pgn: string;
  meta: PgnMeta;
  turn: "w" | "b" | null;
  games: any[];
  search: string;
  onSearch: (s: string) => void;
  selectedGameUrl: string;
  onSelectGame: (url: string) => void;
  loadingGames: boolean;
  onPositionChange: (fen: string) => void;
  onAnalyse: () => void;
  analysing: boolean;
  onShowPgn: () => void;
  onShowLoad: () => void;
}

export const ChessBoardCard: React.FC<Props> = ({
  boardSize,
  pgn,
  meta,
  turn,
  games,
  search,
  onSearch,
  selectedGameUrl,
  onSelectGame,
  loadingGames,
  onPositionChange,
  onAnalyse,
  analysing,
  onShowPgn,
  onShowLoad,
}) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body flex flex-col items-center">
      <h1 className="card-title text-3xl text-center">Chess Buddy</h1>
      <p className="text-sm opacity-80 text-center mb-2">

        W: <span className="font-semibold">{meta.white || "—"}</span> {' '}
        {turn === "w" ? "⬜" : "⬛"} {' '}
        B: <span className="font-semibold">{meta.black || "—"}</span> {' '}
        <span className="">({meta.result || "—"})</span>

      </p>



      {/* <ChessTurnBadge turn={turn} /> */}

      <div className="flex justify-center mb-4 w-full">
        <Chessboard
          width={boardSize}
          height={boardSize}
          className="rounded-lg"
          showNavigation
          pgn={pgn}
          onPositionChange={onPositionChange}
        />
      </div>

      {/* <ChessAnalysisControls
        canAnalyse={Boolean(pgn)}
        analysing={analysing}
        onAnalyse={onAnalyse}
        onShowLoad={onShowLoad}
        onShowPgn={onShowPgn}
      /> */}

      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={onAnalyse} disabled={!Boolean(pgn) || analysing} className="btn btn-neutral btn-sm">
          {analysing ? "Analysing…" : "Analyse"}
        </button>
        <button onClick={onShowLoad} className="btn btn-outline btn-sm">
          Load PGN
        </button>
        <button onClick={onShowPgn} disabled={!Boolean(pgn)} className="btn btn-outline btn-sm">
          Game PGN
        </button>
      </div>

      <div className="mb-2"></div>

      {/* Only show ChessGameSelector if there are games available */}
      {true && (
        // <ChessGameSelector
        //   games={games}
        //   search={search}
        //   onSearch={onSearch}
        //   value={selectedGameUrl}
        //   onChange={onSelectGame}
        //   disabled={loadingGames}
        // />
        <div className="mb-2 w-full flex items-start gap-2">
          <input
            className="input input-sm input-bordered"
            placeholder="Filter games…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            disabled={loadingGames}
          />
          <select
            className="select select-sm select-bordered"
            value={selectedGameUrl}
            onChange={(e) => onSelectGame(e.target.value)}
            disabled={loadingGames}
          >
            {games.length ? (
              games
                .filter((g) => {
                  return true; // (g.time_class == 'rapid' || g.time_class == 'blitz');
                })
                .map((g, i) => {
                  const label = `${i + 1} ${g.eco} ${g.white.username} vs ${g.black.username} (${extractTag("Date", g.pgn)})`;
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
      )}
    </div>
  </div>
);

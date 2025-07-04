import React,  { useState }  from "react";
import { Chessboard } from "@mdwebb/react-chess";
import { ChessBoardAutoPlayButton } from './ChessBoardAutoPlayButton';
import ChessVariationPanel from "./ChessVariationPanel";
import type { PgnMeta } from "../types/chess";
import { extractTag } from "../utils/chess";

interface Props {
  boardSize: number;
  pgn: string;
  fen: string;
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
  analysis: any;
  onShowPgn: () => void;
  onShowLoad: () => void;
  showVariationPanel: boolean;
}

export const ChessBoardCard: React.FC<Props> = ({
  boardSize,
  pgn,
  fen,
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
  analysis,
  onShowPgn,
  onShowLoad,
  showVariationPanel,
}) => {

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body flex flex-col items-center">
        <h1 className="card-title text-3xl text-center">Chess Buddy</h1>
        <p className="text-sm opacity-80 text-center mb-1">

          W: <span className="font-semibold">{meta.white || "—"}</span> {' '}
          {turn === "w" ? "⬜" : "⬛"} {' '}
          B: <span className="font-semibold">{meta.black || "—"}</span> {' '}
          <span className="">({meta.result || "—"})</span>

        </p>

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

        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={onAnalyse} disabled={!Boolean(pgn) || analysing} className="btn btn-neutral btn-sm">
            {analysing ? "Analysing…" : "Analyse"}
          </button>
          <ChessBoardAutoPlayButton />
          <button onClick={onShowLoad} className="btn btn-outline btn-sm">
            Load PGN
          </button>
          <button onClick={onShowPgn} disabled={!Boolean(pgn)} className="btn btn-outline btn-sm">
            Game PGN
          </button>

        </div>
        
        <div className="mb-1"></div>
        
        {showVariationPanel && (<ChessVariationPanel 
          boardSize={boardSize-50}
          initialFen={fen}
          // initialFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          // initialMoves='["e2e4","e7e5"]' 
          //{JSON.stringify(analysis)}
          initialMoves={(analysis && analysis.length>0) ? JSON.stringify(analysis[0].continuationArrCombined) : ''}
        />)}

        <div className="mb-1"></div>

        {/* Only show ChessGameSelector if there are games available */}
        {true && (
          <div className="mb-2 w-full flex items-start gap-1">
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
  )
};

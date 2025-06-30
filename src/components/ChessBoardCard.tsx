import React from "react";
import { Chessboard } from "@mdwebb/react-chess";
import ChessGameSelector from "./ChessGameSelector";
import { ChessTurnBadge } from "./ChessTurnBadge";
import { ChessAnalysisControls } from "./ChessAnalysisControls";
import type { PgnMeta } from "../types/chess";

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
        White: <span className="font-semibold">{meta.white || "—"}</span> |{' '}
        Black: <span className="font-semibold">{meta.black || "—"}</span> |{' '}
        Result: <span className="font-semibold">{meta.result || "—"}</span>
      </p>

      {/* Only show ChessGameSelector if there are games available */}
      {games.length > 0 && (
        <ChessGameSelector
          games={games}
          search={search}
          onSearch={onSearch}
          value={selectedGameUrl}
          onChange={onSelectGame}
          disabled={loadingGames}
        />
      )}

      <ChessTurnBadge turn={turn} />

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

      <ChessAnalysisControls
        canAnalyse={Boolean(pgn)}
        analysing={analysing}
        onAnalyse={onAnalyse}
        onShowLoad={onShowLoad}
        onShowPgn={onShowPgn}
      />
    </div>
  </div>
);

import React from "react";

export const ChessTurnBadge: React.FC<{ turn: "w" | "b" | null }> = ({ turn }) =>
  turn ? (
    <div className="badge badge-info mb-2">
      {turn === "w" ? "White to move ⬜" : "Black to move ⬛"}
    </div>
  ) : null;
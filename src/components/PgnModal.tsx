import React from "react";
import { copyToClipboard } from "../utils/chess";

interface Props {
  open: boolean;
  onClose: () => void;
  pgn: string;
}

export const PgnModal: React.FC<Props> = ({ open, onClose, pgn }) =>
  open ? (
    <div className="modal modal-open" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal-box relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">Game PGN</h3>
          <div className="flex gap-2">
            <button onClick={() => copyToClipboard(pgn)} className="btn btn-outline btn-xs">
              Copy PGN
            </button>
            <button onClick={onClose} className="btn btn-xs btn-circle">
              ✕
            </button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap h-72 overflow-y-auto">{pgn}</pre>
      </div>
    </div>
  ) : null;
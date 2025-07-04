import React, { useState } from "react";
import ChessFilteredPgnDropdown from "./ChessFilteredPgnDropdown";

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (pgn: string) => void;
}

export const ChessLoadPgnModal: React.FC<Props> = ({ open, onClose, onLoad }) => {
  const [text, setText] = useState("");

  const handleLoad = () => {
    if (!text.trim()) return;
    onLoad(text.trim());
    setText("");
    onClose();
  };

  return open ? (
    <div className="modal modal-open" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal-box relative max-h-[80vh]">
        <button onClick={onClose} className="btn btn-xs btn-circle absolute right-2 top-2">
          ✕
        </button>
        
        <h3 className="font-bold text-lg">Paste a PGN</h3>

        <ChessFilteredPgnDropdown
          pgnUrl="/100-golden-games.txt"
          onPgnSelect={pgn => setText(pgn)}
        />

        <textarea
          className="textarea textarea-bordered w-full h-40 mt-4"
          placeholder="Paste PGN here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div className="modal-action">
          <button onClick={handleLoad} disabled={!text.trim()} className="btn btn-primary btn-sm">
            Load
          </button>
        </div>
        
      </div>
    </div>
  ) : null;
};
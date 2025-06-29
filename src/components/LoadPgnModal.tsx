import React, { useState } from "react";
import FilteredPgnDropdown from "../components/FilteredPgnDropdown";

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (pgn: string) => void;
}

export const LoadPgnModal: React.FC<Props> = ({ open, onClose, onLoad }) => {
  const [text, setText] = useState("");

  const handleLoad = () => {
    if (!text.trim()) return;
    onLoad(text.trim());
    setText("");
    onClose();
  };

  return open ? (
    <div className="modal modal-open" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal-box relative">
        <button onClick={onClose} className="btn btn-xs btn-circle absolute right-2 top-2">
          ✕
        </button>
        <h3 className="font-bold text-lg">Paste a PGN</h3>
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
        <FilteredPgnDropdown
          pgnUrl="/tal.txt"
          onPgnSelect={pgn => console.log('Chosen PGN:', pgn)}
        />
      </div>
    </div>
  ) : null;
};
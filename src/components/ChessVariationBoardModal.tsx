import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from '@mdwebb/react-chess';

// This component is correct and does not need changes.
export function ChessVariationContent({ boardSize }: { boardSize: number }) {
  const [fenInput, setFenInput] = useState('');
  const [movesInput, setMovesInput] = useState('[]');
  const [pgn, setPgn] = useState('');

  useEffect(() => {
    let movesArray: string[];
    try {
      movesArray = JSON.parse(movesInput);
      if (!Array.isArray(movesArray)) throw new Error();
    } catch {
      setPgn('');
      return;
    }

    const chess = new Chess();
    if (fenInput.trim()) chess.load(fenInput.trim());

    movesArray.forEach(coord => {
      const from = coord.slice(0, 2) as `${string}${number}`;
      const to = coord.slice(2, 4) as `${string}${number}`;
      chess.move({ from, to });
    });

    setPgn(chess.pgn() || '');
  }, [fenInput, movesInput]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">FEN:</label>
        <textarea
          value={fenInput}
          onChange={e => setFenInput(e.target.value)}
          className="w-full h-24 border rounded p-2"
          placeholder="Enter starting FEN (or leave blank for standard)"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Moves (JSON array):</label>
        <textarea
          value={movesInput}
          onChange={e => setMovesInput(e.target.value)}
          className="w-full h-24 border rounded p-2"
          placeholder='e.g. ["d4d3", "h3g4", ...]'
        />
      </div>
      <Chessboard
        width={boardSize}
        height={boardSize}
        pgn={pgn}
        showMoveHistory={false}
        showNavigation={true}
        className="rounded-lg"
      />
    </div>
  );
}

// FIXED: Accordion-style panel toggled by its header
export default function ChessVariationPanel({ boardSize }: { boardSize: number }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(prev => !prev);

  return (
    // By dynamically adding the 'collapse-open' class, we let the CSS framework handle the accordion state.
    <div
      className={`collapse collapse-arrow bg-base-100 border border-base-300 ${
        open ? 'collapse-open' : ''
      }`}
    >
      <div
        className="collapse-title flex justify-between items-center text-lg font-semibold cursor-pointer"
        onClick={toggleOpen}
      >
        <span>Variation</span>
        {/* <button
          className="btn btn-sm btn-circle"
          // Stop propagation is important to prevent the title's onClick from firing and re-opening the accordion.
          onClick={e => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          ✕
        </button> */}
      </div>

      {/* The content is now a permanent child, allowing for smooth CSS transitions. */}
      <div className="collapse-content p-4 overflow-auto">
        <ChessVariationContent boardSize={boardSize} />
      </div>
    </div>
  );
}
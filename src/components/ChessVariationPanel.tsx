import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from '@mdwebb/react-chess';
import { fenMovesToPgn, combinePgn } from "../utils/chess";

// This component is correct and does not need changes.
export function ChessVariationContent({ boardSize,
  initialFen = '',
  initialMoves = '',
  originalPgn = ''
 }: {
  boardSize: number,
  initialFen?: string,
  initialMoves?: string
  originalPgn?: string
}) {
  const [fenInput, setFenInput] = useState(initialFen);
  const [movesInput, setMovesInput] = useState(initialMoves);
  const [pgn, setPgn] = useState('');

  useEffect(() => {
    setFenInput(initialFen);
  }, [initialFen]);

  useEffect(() => {
    setMovesInput(initialMoves);
  }, [initialMoves]);

  useEffect(() => {

    const convertedPgn = combinePgn(originalPgn, fenInput, JSON.parse(movesInput));
    
    setPgn(convertedPgn || '');

  }, [fenInput, movesInput]);

  return (
    <div className="">
      {/* <div>
        <label className="block font-semibold mb-1">FEN:</label>
        <textarea
          value={fenInput}
          onChange={e => setFenInput(e.target.value)}
          className="w-full h-24 border rounded p-2"
          placeholder="Enter starting FEN (or leave blank for standard)"
        />
      </div> */}
      
      <div className="flex justify-center w-full">
        <Chessboard
          // key={`${initialFen}`}  
          width={boardSize}
          height={boardSize}
          // pgn={pgn}
          pgn={pgn || undefined}
          showMoveHistory={false}
          showNavigation={true}
          className="rounded-lg"
        />
      </div>

      {/* <div className='mt-4'>
        <label className="block font-semibold mb-1">Moves (JSON array):</label>
        <textarea
          value={movesInput}
          onChange={e => setMovesInput(e.target.value)}
          className="w-full h-24 border rounded p-2"
          placeholder='e.g. ["d4d3", "h3g4", ...]'
        />
      </div> */}

    </div>
  );
}

// FIXED: Accordion-style panel toggled by its header
export default function ChessVariationPanel({
  boardSize,
  initialFen = '',
  initialMoves = '',
  originalPgn = ''
 }: {
  boardSize: number,
  initialFen?: string,
  initialMoves?: string
  originalPgn?: string
}) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(prev => !prev);

  return (
    // By dynamically adding the 'collapse-open' class, we let the CSS framework handle the accordion state.
    <div
      className={`collapse collapse-arrow bg-base-100 border border-base-300 ${open ? 'collapse-open' : ''
        }`}
    >
      <div
        className="collapse-title flex justify-between items-center font-semibold cursor-pointer"
        onClick={toggleOpen}
      >
        <span>Analysis Result</span>
      </div>

      {/* The content is now a permanent child, allowing for smooth CSS transitions. */}
      <div className="collapse-content overflow-auto">
        <ChessVariationContent
          boardSize={boardSize}
          initialFen={initialFen}
          initialMoves={initialMoves}
          originalPgn={originalPgn}
        />
      </div>
    </div>
  );
}


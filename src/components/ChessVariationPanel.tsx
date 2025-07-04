import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from '@mdwebb/react-chess';
import { fenMovesToPgn } from "../utils/chess";

// This component is correct and does not need changes.
export function ChessVariationContent({ boardSize,
  initialFen = '',
  initialMoves = ''
 }: {
  boardSize: number,
  initialFen?: string,
  initialMoves?: string
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
    // let movesArray: string[];
    // try {
    //   movesArray = JSON.parse(movesInput);
    //   if (!Array.isArray(movesArray)) throw new Error();
    // } catch {
    //   setPgn('');
    //   return;
    // }

    // const chess = new Chess();
    // if (fenInput.trim()) chess.load(fenInput.trim());

    // try {
    //   movesArray.forEach(coord => {
    //     const from = coord.slice(0, 2) as `${string}${number}`;
    //     const to = coord.slice(2, 4) as `${string}${number}`;
    //     chess.move({ from, to });
    //   });
    // } catch (error) {
    //   console.log('Error parsing moves', error)
    // }

    // setPgn(chess.pgn() || '');

    const convertedPgn = fenMovesToPgn(fenInput, JSON.parse(movesInput));
    console.log('ChessVariationPanel - convertedPgn\n', convertedPgn);
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
          // fen={fenInput.trim() || 'start'}  
          // pgn={pgn}
          pgn={pgn || undefined}
          // fen={pgn ? undefined : (fenInput.trim() || 'start')}
          showMoveHistory={false}
          showNavigation={false}
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
  initialMoves = ''
 }: {
  boardSize: number,
  initialFen?: string,
  initialMoves?: string
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
        <span>Continuation</span>
      </div>

      {/* The content is now a permanent child, allowing for smooth CSS transitions. */}
      <div className="collapse-content overflow-auto">
        {/* <ChessVariationContent
          boardSize={boardSize}
          initialFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          initialMoves='["e2e4","e7e5"]'
        /> */}
        <ChessVariationContent
          boardSize={boardSize}
          initialFen={initialFen}
          initialMoves={initialMoves}
        />
      </div>
    </div>
  );
}


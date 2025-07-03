import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from '@mdwebb/react-chess';

// Separate button component
export function ChessVariationModalButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn btn-outline btn-sm" onClick={onClick}>
      Variation Board
    </button>
  );
}

// Controlled modal component
export function ChessVariationModal({ isOpen, onClose, boardSize }: { isOpen: boolean; onClose: () => void; boardSize: any }) {
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
    <div className={`modal ${isOpen ? 'modal-open' : ''} fixed inset-0 z-50`}>
      <div className="modal-box w-11/12 max-w-4xl relative">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-semibold text-xl mb-4">Variation Preview</h3>
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
            className="rounded-lg"
            pgn={pgn}
            showMoveHistory={false}
            showNavigation={true}
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// // Container that ties button and modal together
// export default function ChessVariationBoardModalContainer() {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <>
//       <OpenVariationModalButton onClick={() => setIsOpen(true)} />
//       <VariationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
//     </>
//   );
// }

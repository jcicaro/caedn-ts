// src/pages/JcChessGame.tsx
import React, { useRef, useState } from 'react';
import { Chessboard, ChessboardRef } from '@mdwebb/react-chess';
import { useChessResponsiveBoardSize } from "../hooks/useChessResponsiveBoardSize";
import { combinePgn } from "../utils/chess";

const JcChessGame: React.FC = () => {
    const boardRef = useRef<ChessboardRef>(null);
    const boardSize = useChessResponsiveBoardSize();

    const [pgn, setPgn] = useState('');
    const [analysis, setAnalysis] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedMove, setSuggestedMove] = useState<string>('');

    const fetchAnalysis = async (fen: string) => {
        try {
            const res = await fetch('https://chess-api.com/v1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen, depth: 18, maxThinkingTime: 100 }),
            });
            if (!res.ok) throw new Error(`API error ${res.status}`);
            const data = await res.json();
            const moves = Array.isArray(data)
                ? data
                : Array.isArray(data.moves)
                    ? data.moves
                    : [data];

            setAnalysis(moves);
            setSuggestedMove(moves[0].san);

        } catch (e: any) {
            setError(e.message);
            setAnalysis([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMove = async (from: string, to: string) => {
        const game = boardRef.current?.game;
        if (!game) return;

        setPgn(game.pgn());
        
        setLoading(true);
        setError(null);

        fetchAnalysis(game.fen());

        console.log('Chessboard', Chessboard);
        console.log('boardRef', boardRef);
        // console.log('turn', game?.turn());

        // const api = boardRef.current?.api;
        // if (!api) return;
        // api.toggleOrientation();

    };

    const applySuggestedMove = () => {

        const api = boardRef.current?.api;
        if (!api) return;

        api.move(analysis[0].from, analysis[0].to);

        // This will trigger a re-render of the Chessboard with the new position.
        // const game = boardRef.current?.game;
        // if (!game) return;
        // const newPgn = game.pgn();
        // setPgn(newPgn);
        // game.loadPgn(newPgn);

        // const currentPgn = game.pgn();
        // const currentFen = game.fen();
        // const combinedPgn = combinePgn(currentPgn, currentFen, [suggestedMove]);

        // setPgn(combinedPgn);

    };

    // const __applySuggestedMove = () => {
    //     const board = boardRef.current;
    //     if (!board || analysis.length === 0) return;

    //     const game = board.game;           // the Chess.js instance
    //     const { from, to, promotion } = analysis[0];

    //     // 1️⃣  Update the real game – this flips the turn internally
    //     const move = game?.move({ from, to, promotion: promotion ?? 'q' });
    //     if (!move) {
    //         console.warn('Suggested move was illegal for current position');
    //         return;
    //     }

    //     // 2️⃣  Tell the UI about the new position.
    //     //     You can EITHER set PGN OR call board.api.setPosition(game.fen()).
    //     //     PGN keeps the move list visible, so we’ll use it:
    //     if (game) {
    //         console.log('game', game);
    //         setPgn(game.pgn());
    //         game.loadPgn(game.pgn());
    //     }

    // };



    return (
        <div className="md:flex gap-4 mt-6">
            {/* Left column: centered board + PGN */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-4 mb-4">

                <h1 className="text-3xl font-bold text-center">Let's Play Chess!</h1>

                <button
                    onClick={applySuggestedMove}
                    // disabled={!suggestedMove || loading}
                    disabled // applySuggestedMove doesn't work correctly
                    className="btn btn-ghost">
                    {suggestedMove
                        ? `${suggestedMove}`
                        : "Make your move..."}</button>

                <Chessboard
                    width={boardSize + 30}
                    height={boardSize + 30}
                    ref={boardRef}
                    onMove={handleMove}
                    className="rounded-lg"
                    showNavigation
                    pgn={pgn || undefined}
                />

                <textarea
                    className="textarea textarea-bordered w-full max-w-[600px] h-24 mt-4"
                    readOnly
                    value={pgn}
                    placeholder="PGN will appear here…"
                />
            </div>

            {/* Right column: analysis JSON */}
            <div className="w-full md:w-1/2 space-y-2 overflow-auto">
                {loading && <p>Analyzing…</p>}
                {error && <p className="text-red-500">Error: {error}</p>}

                {!loading && !error && analysis.length > 0 && (
                    <pre className="p-2 bg-gray-100 rounded w-full h-[510px] overflow-auto text-sm">
                        {JSON.stringify(analysis, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default JcChessGame;



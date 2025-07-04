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
            setSuggestedMove(moves[0].move);

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
        const fen = game.fen();

        setLoading(true);
        setError(null);
        
        fetchAnalysis(fen);
    };

    const applySuggestedMove = () => {
        const game = boardRef.current?.game;
        if (!game) return;

        const currentPgn = game.pgn();
        const currentFen = game.fen();
        const combinedPgn = combinePgn(currentPgn, currentFen, [suggestedMove]);

        console.log(combinedPgn);

        // setPgn(combinedPgn);

        // const updatedGame = boardRef.current?.game;
        // if (!updatedGame) return;
        // const fen = updatedGame.fen();

        // setLoading(true);
        // setError(null);

        // fetchAnalysis(fen);
    };

    return (
        <div className="h-screen md:flex gap-4 md:mt-10">
            {/* Left column: centered board + PGN */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center h-full space-y-4">

                <h1 className="text-3xl text-center">Let's Play Chess!</h1>

                <button
                    onClick={applySuggestedMove}
                    disabled={!suggestedMove || loading}
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



import React, { useState, useEffect, useRef } from "react";
import { useChessResponsiveBoardSize } from "../hooks/useChessResponsiveBoardSize";
import { useChessGame } from "../hooks/useChessGame";
import { ChessBoardCard } from "../components/ChessBoardCard";
import { ChessCoachChat } from "../components/ChessCoachChat";
import { ChessShowPgnModal } from "../components/ChessShowPgnModal";
import { ChessLoadPgnModal } from "../components/ChessLoadPgnModal";

import { useChat } from "../hooks/useChat";

const INITIAL_PROMPT = `
Your name is ChessBuddy.
Whenever I give you a board position and analysis, explain it in simple terms and make it very concise.
If there's ECO mentioned, tell information about the chess opening used.
Unless I specify, the \"move\" I mention is the best next move the AI has determined.
If you're unsure what piece is currently on the position, just mention \"piece\" instead of guessing.
When there's a continuation array, it is showing the next two most likely moves after the suggested best move for both sides. 
Just list out the continuation but do not explain the moves.
You do not need to give the user the current board position, 
but if it's relavant explain it into something easily understood instead of giving in FEN format.
Add some emojis to make it more visual.
Do not mention anything about the depth. Do not mention the evaluation score. Do not mention the current position understanding.
Return the response in markdown with the key information highlighted. 
Also break it down into multiple sections with different headers which are in bold.
`;

const JcChessTraining: React.FC = () => {
  const boardSize = useChessResponsiveBoardSize();
  const {
    pgn,
    setPgn,
    meta,
    currentTurn,
    filteredGames,
    search,
    setSearch,
    selectedGameUrl,
    selectGame,
    loadingGames,
    handlePositionChange,
    analyse,
    loadingAn,
  } = useChessGame();

  const { messages, loading: chatLoading, error: chatError, send: sendToChat } =
    useChat(INITIAL_PROMPT, import.meta.env.VITE_OPENAI_MODEL);

  const [showPgnModal, setShowPgnModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showVariationBoardModal, setShowVariationBoardModal] = useState(false);

  const handleAnalyse = async () => {
    const result = await analyse();
    console.log('handleAnalyse', result, currentTurn);

    const entry = result[0];
    if (!entry?.continuation || entry.continuation.length < 2) {
      return '';
    }

    // continuation[0] is the next move for whoever's turn it is,
    // continuation[1] is the reply.
    const [firstMove, secondMove] = entry.continuation;

    // decide labels based on currentTurn
    const firstLabel = currentTurn === 'b' ? 'White' : 'Black';
    const secondLabel = currentTurn === 'b' ? 'Black' : 'White';

    const suggestedMoves = `${entry.text}; THEN: ${firstLabel}: ${firstMove.from} to ${firstMove.to}; ` +
      `${secondLabel}: ${secondMove.from} to ${secondMove.to}`;

    if (result) sendToChat('ECO: ' + meta.eco + '\n\nSuggested Moves: ' + suggestedMoves + '\n\n' + JSON.stringify(result));
  };

  function useArrowKeyMoves() {
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        let selector: string | null = null;

        if (e.key === 'ArrowRight') {
          selector = 'button[aria-label="Next move"]';
        } else if (e.key === 'ArrowLeft') {
          selector = 'button[aria-label="Previous move"]';
        }

        if (selector) {
          const btn = document.querySelector<HTMLButtonElement>(selector);
          if (btn && !btn.disabled) {
            e.preventDefault();
            btn.click();
          }
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
  }
  useArrowKeyMoves();
  //   // Store the interval ID so we can clear it later
  //   const intervalRef = useRef<number | null>(null);

  //   useEffect(() => {
  //     const onKeyDown = (e: KeyboardEvent) => {
  //       // Check for Ctrl+Shift+P
  //       if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
  //         e.preventDefault();

  //         // If not already running, start it
  //         if (intervalRef.current === null) {
  //           intervalRef.current = window.setInterval(() => {
  //             const btn = document.querySelector<HTMLButtonElement>(
  //               'button[aria-label="Next move"]'
  //             );
  //             if (btn && !btn.disabled) {
  //               btn.click();
  //             }
  //           }, 3000);
  //           console.log('⏯️ Auto-next started');
  //         }
  //         // Otherwise, stop it
  //         else {
  //           clearInterval(intervalRef.current);
  //           intervalRef.current = null;
  //           console.log('⏹️ Auto-next stopped');
  //         }
  //       }
  //     };

  //     window.addEventListener('keydown', onKeyDown);
  //     return () => {
  //       window.removeEventListener('keydown', onKeyDown);
  //       if (intervalRef.current !== null) {
  //         clearInterval(intervalRef.current);
  //       }
  //     };
  //   }, []);
  // }
  // useAutoNextOnShortcut();

  return (
    <div className="h-screen md:flex md:items-start gap-4">
      <div className="md:w-1/2 lg:w-2/5 flex-shrink-0 md:sticky md:top-0">
        <ChessBoardCard
          boardSize={boardSize}
          pgn={pgn}
          meta={meta}
          turn={currentTurn}
          games={filteredGames}
          search={search}
          onSearch={setSearch}
          selectedGameUrl={selectedGameUrl}
          onSelectGame={selectGame}
          loadingGames={loadingGames}
          onPositionChange={handlePositionChange}
          onAnalyse={handleAnalyse}
          analysing={loadingAn}
          onShowPgn={() => setShowPgnModal(true)}
          onShowLoad={() => setShowLoadModal(true)}
        />
      </div>

      <div className="mt-4 md:mt-0 flex-1 flex flex-col h-[70vh] md:h-screen">
        <ChessCoachChat
          messages={messages}
          loading={chatLoading}
          error={chatError}
          onSend={sendToChat}
        />
      </div>

      <ChessShowPgnModal open={showPgnModal} onClose={() => setShowPgnModal(false)} pgn={pgn} />
      <ChessLoadPgnModal
        boardSize={boardSize}
        open={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={(txt) => {
          setPgn(txt);
          selectGame("");
        }}
      />
      
    </div>
  );
};

export default JcChessTraining;



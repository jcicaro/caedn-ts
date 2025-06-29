import React, { useState } from "react";
import { useResponsiveBoardSize } from "../hooks/useResponsiveBoardSize";
import { useChessGame } from "../hooks/useChessGame";
import { ChessBoardCard } from "../components/ChessBoardCard";
import { CoachChat } from "../components/CoachChat";
import { PgnModal } from "../components/PgnModal";
import { LoadPgnModal } from "../components/LoadPgnModal";
import { useChat } from "../hooks/useChat";

const INITIAL_PROMPT = `Your name is ChessBuddy.
Whenever I give you a board position and analysis, explain it in simple terms that a 6 year old can understand.
Unless I specify, the \"move\" I mention is the best next move the AI has determined.
If you're unsure what piece is currently on the position, just mention \"piece\" instead of guessing.
When there's a continuation array, it is showing the next two most likely moves after the suggested best move for both sides.
When giving the board position, explain it into something easily understood instead of giving in FEN format.
Add some emojis to make it more visual.
Do not mention anything about the depth.`;

const JcChessTraining: React.FC = () => {
  const boardSize = useResponsiveBoardSize();
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

  const handleAnalyse = async () => {
    const result = await analyse();
    if (result) sendToChat(JSON.stringify(result));
  };

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
        <CoachChat
          messages={messages}
          loading={chatLoading}
          error={chatError}
          onSend={sendToChat}
        />
      </div>

      <PgnModal open={showPgnModal} onClose={() => setShowPgnModal(false)} pgn={pgn} />
      <LoadPgnModal
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



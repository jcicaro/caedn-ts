import React from "react";

interface Props {
  canAnalyse: boolean;
  analysing: boolean;
  onAnalyse: () => void;
  onShowPgn: () => void;
  onShowLoad: () => void;
}

export const ChessAnalysisControls: React.FC<Props> = ({ canAnalyse, analysing, onAnalyse, onShowPgn, onShowLoad }) => (
  <div className="flex flex-wrap gap-2 justify-center">
    <button onClick={onAnalyse} disabled={!canAnalyse || analysing} className="btn btn-neutral btn-sm">
      {analysing ? "Analysing…" : "Analyse"}
    </button>
    <button onClick={onShowLoad} className="btn btn-outline btn-sm">
      Load PGN
    </button>
    <button onClick={onShowPgn} disabled={!canAnalyse} className="btn btn-outline btn-sm">
      Game PGN
    </button>
  </div>
);
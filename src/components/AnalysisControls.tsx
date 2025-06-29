import React from "react";

interface Props {
  canAnalyse: boolean;
  analysing: boolean;
  onAnalyse: () => void;
  onShowPgn: () => void;
  onShowLoad: () => void;
}

export const AnalysisControls: React.FC<Props> = ({ canAnalyse, analysing, onAnalyse, onShowPgn, onShowLoad }) => (
  <div className="flex flex-wrap gap-2 justify-center">
    <button onClick={onAnalyse} disabled={!canAnalyse || analysing} className="btn btn-success btn-sm">
      {analysing ? "Analysing…" : "Analyse"}
    </button>
    <button onClick={onShowLoad} className="btn btn-primary btn-sm">
      Load PGN
    </button>
    <button onClick={onShowPgn} disabled={!canAnalyse} className="btn btn-secondary btn-sm">
      Show PGN
    </button>
  </div>
);
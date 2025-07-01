// src/App.tsx
import React, { useState, useRef } from 'react';
import { convertPgnToJson, Game } from '../utils/chessComConverterForPgn.ts';

const JcChessComConverterForPgnPage: React.FC = () => {
  // ref to the textarea
  const pgnInputRef = useRef<HTMLTextAreaElement>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleConvert = () => {
    // grab the current value from the textarea
    const raw = pgnInputRef.current?.value.trim() || '';
    if (!raw) {
      setError('PGN input cannot be empty.');
      setJsonOutput('');
      return;
    }

    try {
      const games: Game[] = convertPgnToJson(raw);
      setJsonOutput(JSON.stringify(games, null, 2));
      setError('');
    } catch (e) {
      console.error(e);
      setError('Failed to parse PGN. Please check the format.');
      setJsonOutput('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="card shadow-lg bg-base-100">
        <div className="card-body">
          <h2 className="card-title">PGN → JSON Converter</h2>

          {/* Top textarea for PGN input */}
          <label htmlFor="pgn-input" className="label">
            <span className="label-text">Paste PGN games here</span>
          </label>
          <textarea
            id="pgn-input"
            ref={pgnInputRef}
            className="textarea textarea-bordered w-full h-64 mb-4"
            placeholder='e.g. [Event "…"] 1. e4 e5 2. Nf3 Nc6 …'
            // uncontrolled now—no value or onChange
            defaultValue=""
          />

          {/* Convert button */}
          <button className="btn btn-primary mb-4" onClick={handleConvert}>
            Convert
          </button>

          {/* Error message */}
          {error && <div className="text-sm text-error mb-4">{error}</div>}

          {/* Bottom textarea for JSON output */}
          <label htmlFor="json-output" className="label">
            <span className="label-text">Converted JSON</span>
          </label>
          <textarea
            id="json-output"
            className="textarea textarea-bordered w-full h-64"
            placeholder="Your JSON will appear here..."
            value={jsonOutput}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default JcChessComConverterForPgnPage;

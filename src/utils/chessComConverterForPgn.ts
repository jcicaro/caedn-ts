/**
 * @file PGN Conversion Utility for React
 * @description This utility file exports a function to convert PGN strings into a structured
 * JSON format, similar to the chess.com API. It's designed to be imported into React components.
 */

import { Chess } from "chess.js";
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITIONS ---
// Exporting types allows them to be used in component props, state, etc.
export interface Player {
    rating: number | null;
    result: string;
    '@id': string;
    username: string;
    uuid: string;
}

export interface Game {
    url: string;
    pgn: string;
    time_control: string | null;
    end_time: number; // Unix timestamp
    rated: boolean | null;
    tcn: string | null;
    uuid: string;
    initial_setup: string;
    fen: string;
    time_class: string | null;
    rules: string;
    white: Player;
    black: Player;
    eco?: string;
}

/**
 * Parses the result string (e.g., "1-0", "0-1", "1/2-1/2") to determine player outcomes.
 * @param result - The result string from the PGN.
 * @returns An object containing the result for white and black.
 */
function parseResult(result: string): { whiteResult: string; blackResult: string } {
    if (result === '1-0') {
        return { whiteResult: 'win', blackResult: 'loss' };
    }
    if (result === '0-1') {
        return { whiteResult: 'loss', blackResult: 'win' };
    }
    if (result === '1/2-1/2') {
        return { whiteResult: 'draw', blackResult: 'draw' };
    }
    // Default case for ongoing games or unknown results
    return { whiteResult: 'unknown', blackResult: 'unknown' };
}

/**
 * Converts a PGN date string (e.g., "1955.??.??") into a Unix timestamp.
 * It handles incomplete dates by defaulting to the first month or day.
 * @param dateStr - The date string from the PGN header.
 * @returns A Unix timestamp (number).
 */
function dateToTimestamp(dateStr: string): number {
    // Replace unknown parts with defaults (01 for day/month)
    const cleanDateStr = dateStr.replace(/\?/g, '01');
    const date = new Date(cleanDateStr);
    // Return Unix timestamp in seconds
    return Math.floor(date.getTime() / 1000);
}

/**
   * Converts a PGN string to the final FEN position.
   * @param rawPgn Full PGN text for a single game
   * @returns FEN string of the resulting position
   */
export const convertPgnToFen = (rawPgn: string): string => {
    const chess = new Chess();
    chess.loadPgn(rawPgn);
    return chess.fen();
  };

/**
 * Converts a string containing one or more PGN games into an array of structured game objects.
 * This is the main function to be imported into your React components.
 * @param pgnString - A string with PGN data. Games can be separated by double newlines.
 * @returns An array of Game objects, formatted similarly to the chess.com API.
 *
 * @example
 * import { convertPgnToJson } from './pgnConverter';
 * const pgnData = "[Event \"..."] ...";
 * const games = convertPgnToJson(pgnData);
 */
export const convertPgnToJson = (pgnString: string): Game[] => {
    // 1. Split the input string into individual games. PGNs are often separated by two newlines.
    const gamesPgn = pgnString.trim().split(/\n\n(?=\[Event)/);
    const games: Game[] = [];

    for (const singlePgn of gamesPgn) {
        if (!singlePgn.trim()) continue; // Skip empty entries

        const lines = singlePgn.trim().split('\n');
        const headers: { [key: string]: string } = {};
        let moveText = '';

        // 2. Separate headers from the move text
        for (const line of lines) {
            if (line.startsWith('[')) {
                const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
                if (match) {
                    headers[match[1]] = match[2];
                }
            } else if (line.trim() !== '') {
                // The rest of the string is the move text
                moveText += line + ' ';
            }
        }
        moveText = moveText.trim();

        // 3. Parse the result and determine player outcomes
        const result = headers['Result'] || '*';
        const { whiteResult, blackResult } = parseResult(result);
        
        // 4. Generate a unique ID for the game
        const gameUuid = uuidv4(); // crypto.randomUUID();

        // 5. Construct the final Game object based on the parsed data
        const game: Game = {
            url: `https://www.chess.com/game/live/${Math.floor(Math.random() * 1e12)}`, // Placeholder URL
            pgn: singlePgn,
            time_control: headers['TimeControl'] || null,
            end_time: dateToTimestamp(headers['Date'] || '????.??.??'),
            rated: null, // This info is not in the basic PGN
            tcn: null, // This info is not in the basic PGN
            uuid: gameUuid,
            initial_setup: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Standard starting position
            fen: convertPgnToFen(singlePgn), // Would require a full chess engine to calculate the final FEN
            time_class: null, // Cannot be determined from basic PGN
            rules: 'chess',
            white: {
                rating: headers['WhiteElo'] ? parseInt(headers['WhiteElo'], 10) : null,
                result: whiteResult,
                '@id': `https://api.chess.com/pub/player/${headers['White']?.toLowerCase().replace(/\s/g, '_')}`,
                username: headers['White'] || 'Unknown',
                uuid: uuidv4() // crypto.randomUUID(), // Placeholder UUID
            },
            black: {
                rating: headers['BlackElo'] ? parseInt(headers['BlackElo'], 10) : null,
                result: blackResult,
                '@id': `https://api.chess.com/pub/player/${headers['Black']?.toLowerCase().replace(/\s/g, '_')}`,
                username: headers['Black'] || 'Unknown',
                uuid: uuidv4() // crypto.randomUUID(), // Placeholder UUID
            },
            eco: headers['ECO'] || undefined,
        };

        games.push(game);
    }

    return games;
};

/*
// src/App.tsx
import React, { useState } from 'react';
import { convertPgnToJson, Game } from './utils/pgnConverter'; // Adjust the path if needed

// Example PGN string to use as a default value
const samplePgn = `[Event "USA-chJ"]
[Site "?"]
[Date "1955.11.12"]
[Round "?"]
[White "Thomason, J."]
[Black "Fischer, Robert James"]
[Result "0-1"]
[ECO "E91"]

1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Bd3 Bg4 7.O-O Nc6 8.Be3 Nd7 9.Be2 Bxf3 10.Bxf3 e5 11.d5 Ne7 12.Be2 f5 13.f4 h6 14.Bd3 Kh7 15.Qe2 fxe4 16.Nxe4 Nf5 17.Bd2 exf4 18.Bxf4 Ne5 19.Bc2 Nd4 20.Qd2 Nxc4 21.Qf2 Rxf4 22.Qxf4 Ne2+ 23.Kh1 Nxf4 0-1

[Event "USA-chJ"]
[Site "?"]
[Date "1955.07.09"]
[Round "?"]
[White "Fischer, Robert James"]
[Black "Warner, K."]
[Result "1-0"]
[ECO "B72"]

1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 d6 6.Be2 g6 7.Be3 Bg7 8.f3 O-O 9.Qd2 a6 10.O-O-O Qa5 11.Kb1 Rd8 12.g4 Nxd4 13.Bxd4 Be6 14.Qe3 Nd7 15.f4 Bxd4 16.Qxd4 Nf6 17.f5 Bd7 18.h4 Bb5 19.Bf3 Rac8 20.Nxb5 axb5 21.h5 Rc4 22.Qe3 Ra8 23.a3 Qa4 24.c3 Nxe4 25.Bxe4 Rxe4 26.Qh6 Re2 27.Rd2 Rxd2 28.Qxd2 Qe4+ 1-0`;

function App() {
  const [pgnText, setPgnText] = useState<string>(samplePgn);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string>('');

  const handleConvert = () => {
    if (!pgnText.trim()) {
      setError('PGN input cannot be empty.');
      setGames([]);
      return;
    }
    try {
      const convertedGames = convertPgnToJson(pgnText);
      setGames(convertedGames);
      setError('');
    } catch (e) {
      setError('Failed to parse PGN. Please check the format.');
      setGames([]);
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>PGN to JSON Converter</h1>
      <textarea
        value={pgnText}
        onChange={(e) => setPgnText(e.target.value)}
        rows={15}
        style={{ width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
        placeholder="Paste your PGN string here..."
      />
      <button onClick={handleConvert} style={{ marginBottom: '20px' }}>
        Convert
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {games.length > 0 && (
        <div>
          <h2>Converted Games ({games.length})</h2>
          {games.map((game) => (
            <div key={game.uuid} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <p><strong>Event:</strong> {game.pgn.match(/\[Event "([^"]+)"\]/)?.[1] || 'N/A'}</p>
              <p><strong>White:</strong> {game.white.username} ({game.white.result})</p>
              <p><strong>Black:</strong> {game.black.username} ({game.black.result})</p>
              <p><strong>Date:</strong> {new Date(game.end_time * 1000).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
*/
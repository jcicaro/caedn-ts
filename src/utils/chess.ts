import { Chess, type Move } from "chess.js";
import type { MoveAnalysis } from "../types/chess";

export const extractTag = (tag: string, pgn: string): string | undefined => {
  const m = pgn.match(new RegExp(`\\\[${tag}\\s+"([^"]+)"\\\]`, "i"));
  return m?.[1];
};

export const getTurnFromFen = (fen: string): "w" | "b" | null => {
  const p = fen.split(" ");
  return p[1] === "w" || p[1] === "b" ? (p[1] as "w" | "b") : null;
};

export const normalizeAnalysis = (raw: any): MoveAnalysis => ({
  move: raw.move ?? raw.san ?? raw.lan,
  evaluation: raw.eval ?? raw.evaluation,
  best: raw.bestmove ?? raw.best ?? raw.bestMove,
  depth: raw.depth,
  text: raw.text ?? raw.comment,
  continuation: raw.continuation,
  continuationArr: raw.continuationArr,
  continuationArrCombined: [raw.move, ...raw.continuationArr],
  fen: raw.fen,
});

export const parsePgn = (pgn: string) => {
  const meta = {
    white: extractTag("White", pgn),
    black: extractTag("Black", pgn),
    result: extractTag("Result", pgn),
    eco: extractTag("ECO", pgn),
    date: extractTag("Date", pgn),
  };

  let fen = "";
  let turn: "w" | "b" | null = null;

  try {
    const c = new Chess();
    (c as any).loadPgn?.(pgn, { sloppy: true }) ??
      (c as any).load_pgn?.(pgn, { sloppy: true });
    fen = c.fen();
    turn = c.turn();
  } catch {
    /* ignore */
  }

  if (!fen) {
    const m = pgn.match(/\[FEN\s+"([^"]+)"/i);
    if (m) {
      fen = m[1];
      turn = getTurnFromFen(m[1]);
    }
  }

  if (!fen) {
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    turn = "w";
  }

  return { meta, fen, turn };
};


export function fenMovesToPgn(startFen = "", coords: string[]): string {
  const chess = new Chess(startFen.trim() ? startFen : undefined);

  coords.forEach(c => {
    chess.move({
      from: c.slice(0, 2) as `${string}${number}`,
      to:   c.slice(2, 4) as `${string}${number}`,
      promotion: "q",     // safe default for promotions
    });
  });

  const headers =
    startFen && startFen !== "start"
      ? `[SetUp "1"]\n[FEN "${startFen}"]\n\n`
      : "";

  return headers + chess.pgn();
}

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).catch(console.error);
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
};


/**
 * Merge an original PGN, a “current” FEN and an array of continuation
 * moves (UCI-notation) into one valid PGN.
 *
 *  • `originalPgn`  – the PGN up to the interruption point  
 *  • `currentFen`   – the board position where play resumes  
 *  • `continuationMoves` – moves to append, e.g. ["e2e4", "g1f3", "e7e8q"]
 *
 * Throws if:
 *  – the PGN cannot be parsed  
 *  – `currentFen` never occurs in that PGN  
 *  – any continuation move is illegal
 */
export function combinePgn(
  originalPgn: string,
  currentFen: string,
  continuationMoves: string[]
): string {
  // ───────────────────────────────────── 1. Parse the PGN
  const parser = new Chess();

  parser.loadPgn(originalPgn);
  // if (!parser.loadPgn(originalPgn)) {
  //   throw new Error('Invalid PGN: could not be parsed.');
  // }

  // Extract any custom starting position from headers
  const headers = parser.header();                // { Event: "...", FEN: "...", ... }
  const startingFen =
    headers.SetUp === '1' && headers.FEN ? headers.FEN : undefined;

  // Verbose history = array of Move objects
  const history = parser.history({ verbose: true });

  // ───────────────────────────────────── 2. Find the ply matching `currentFen`
  const probe = new Chess(startingFen);
  const stripCounters = (fen: string) => fen.split(' ').slice(0, 4).join(' ');
  const target = stripCounters(currentFen);

  let cutPly = -1;

  if (stripCounters(probe.fen()) === target) {
    cutPly = 0;
  } else {
    for (let i = 0; i < history.length; i++) {
      probe.move(history[i] as Move);
      if (stripCounters(probe.fen()) === target) {
        cutPly = i + 1;              // include the matching ply
        break;
      }
    }
  }

  if (cutPly === -1) {
    throw new Error('The supplied FEN does not occur in the PGN.');
  }

  // ───────────────────────────────────── 3. Re-create the game to that ply
  const combined = new Chess(startingFen);
  for (let i = 0; i < cutPly; i++) {
    combined.move(history[i] as Move);
  }

  // ───────────────────────────────────── 4. Append the continuation moves
  for (const uci of continuationMoves) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.slice(4) || undefined;

    if (!combined.move({ from, to, promotion })) {
      throw new Error(`Illegal continuation move: "${uci}"`);
    }
  }

  // ───────────────────────────────────── 5. Export the fresh PGN
  return combined.pgn();
}
import { Chess } from "chess.js";
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

/**
 * Convert a starting FEN and an array of coordinate moves (e.g. "e2e4")
 * into a PGN string suitable for @mdwebb/react-chess.
 *
 * @param fen   starting position. Use "" or "start" for the normal initial board.
 * @param moves list of coordinate strings in long-algebraic notation.
 * @returns     PGN text, or an empty string if the input is invalid.
 */
export const __fenMovesToPgn = function (fen: string, moves: string[]): string {
  /* ---------- basic validation ------------------------------------------------ */
  if (
    !Array.isArray(moves) ||
    moves.some((m) => typeof m !== "string" || m.length < 4)
  ) {
    console.warn("fenMovesToPgn: moves must be an array of coordinate strings");
    return "";
  }

  /* ---------- set up a chess.js game ------------------------------------------ */
  const chess = new Chess();

  const trimmedFen = fen?.trim();
  chess.load(trimmedFen);
  // if (trimmedFen && trimmedFen !== "start") {
  //   if (!chess.load(trimmedFen)) {
  //     console.warn("fenMovesToPgn: invalid FEN supplied");
  //     return "";
  //   }
  // }

  /* ---------- play the moves --------------------------------------------------- */
  for (const coord of moves) {
    const from = coord.slice(0, 2) as `${string}${number}`;
    const to = coord.slice(2, 4) as `${string}${number}`;
    try {
      // if (!chess.move({ from, to })) {
      //   console.warn(
      //     `fenMovesToPgn: illegal move '${coord}' for current position`
      //   );
      //   return "";
      // }
      chess.move({ from, to });
    } catch (error) {
      console.log('fenMovesToPgn', error);
    }
  }

  /* ---------- assemble PGN with headers ---------------------------------------- */
  const headers =
    trimmedFen && trimmedFen !== "start"
      ? `[SetUp "1"]\n[FEN "${trimmedFen}"]\n\n`
      : "";

  // chess.pgn() already includes move numbers and SAN; we keep line-feeds.
  const body = chess.pgn();

  return headers + body;
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

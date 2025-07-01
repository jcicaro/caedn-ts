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
  fen: raw.fen,
});

export const parsePgn = (pgn: string) => {
  const meta = {
    white: extractTag("White", pgn),
    black: extractTag("Black", pgn),
    result: extractTag("Result", pgn),
    eco: extractTag("ECO", pgn),
  };

  let fen = "";
  let turn: "w" | "b" | null = null;

  try {
    const c = new Chess();
    (c as any).loadPgn?.(pgn, { sloppy: true }) ?? (c as any).load_pgn?.(pgn, { sloppy: true });
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
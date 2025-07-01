export interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
  text?: string;
  fen?: string;
  continuation?: Array<object>;
}

export interface PgnMeta {
  white?: string;
  black?: string;
  result?: string;
  eco?: string;
}
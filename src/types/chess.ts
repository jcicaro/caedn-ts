export interface MoveAnalysis {
  move?: string;
  evaluation?: number;
  best?: string;
  depth?: number;
  text?: string;
  fen?: string;
  continuation?: Array<object>;
  continuationArr?: Array<string>;
  continuationArrCombined?: Array<string>;
}

export interface PgnMeta {
  white?: string;
  black?: string;
  result?: string;
  eco?: string;
  date?: string;
}
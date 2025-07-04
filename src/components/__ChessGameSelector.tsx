import React from "react";
import { extractTag } from "../utils/chess";

interface Props {
  games: any[];
  search: string;
  onSearch: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const ChessGameSelector: React.FC<Props> = ({ games, search, onSearch, value, onChange, disabled }) => (
  <div className="mb-2 w-full flex items-start gap-2">
    <input
      className="input input-sm input-bordered"
      placeholder="Filter games…"
      value={search}
      onChange={(e) => onSearch(e.target.value)}
      disabled={disabled}
    />
    <select
      className="select select-sm select-bordered"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {games.length ? (
        games
          .filter((g) => {
            // console.log(g);
            return true; // (g.time_class == 'rapid' || g.time_class == 'blitz');
          })
          .map((g, i) => {
            // const label = `${new Date(
            //   g.end_time * 1000
            // ).toLocaleDateString()} ${g.white.username} vs ${g.black.username}`;
            const label = `${i+1} ${g.eco} ${g.white.username} vs ${g.black.username} (${extractTag("Date", g.pgn)})`;
            return (
              <option key={g.url} value={g.url}>
                {label}
              </option>
            );
          })
      ) : (
        <option disabled>No games available</option>
      )}
    </select>
  </div>
);

export default ChessGameSelector;
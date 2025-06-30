import React from "react";

interface Props {
  games: any[];
  search: string;
  onSearch: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const ChessGameSelector: React.FC<Props> = ({ games, search, onSearch, value, onChange, disabled }) => (
  <div className="mb-4 w-full">
    <input
      className="input input-bordered w-full mb-2"
      placeholder="Search games…"
      value={search}
      onChange={(e) => onSearch(e.target.value)}
      disabled={disabled}
    />
    <select
      className="select select-bordered w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {games.length ? (
        games
        .filter((g) => {
          return (g.time_class == 'rapid' || g.time_class == 'blitz');
        })
        .map((g) => {
          const opp = g.white.username.toLowerCase() === "magnuscarlsen" ? g.black.username : g.white.username;
          const label = `${new Date(g.end_time * 1000).toLocaleDateString()} vs ${opp} [${g.time_class}]`;
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
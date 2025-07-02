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
  <div className="mb-2 w-full">
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
            // console.log(g);
            return true; // (g.time_class == 'rapid' || g.time_class == 'blitz');
          })
          .map((g) => {
            // const label = `${new Date(
            //   g.end_time * 1000
            // ).toLocaleDateString()} ${g.white.username} vs ${g.black.username}`;
            const label = `${g.eco} ${g.white.username} vs ${g.black.username}`;
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
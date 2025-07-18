import React, { useState, useEffect } from 'react';
import { copyToClipboard } from "../utils/chess";
import { extractTag } from "../utils/chess";

interface ChessFilteredPgnDropdownProps {
    /** URL to fetch the PGN text file from */
    pgnUrl: string;
    /**
     * Callback fired when a PGN is selected.
     * Receives the full PGN string of the selected game.
     */
    onPgnSelect?: (pgn: string) => void;
}

const ChessFilteredPgnDropdown: React.FC<ChessFilteredPgnDropdownProps> = ({
    pgnUrl,
    onPgnSelect,
}) => {
    const [pgnList, setPgnList] = useState<string[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
    const [selectedPgn, setSelectedPgn] = useState<string | undefined>();

    

    useEffect(() => {
        fetch(pgnUrl)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch: ' + res.status);
                return res.text();
            })
            .then(text => {
                const games = text
                    // Split by blank line before the next [Event] tag (common PGN separator)
                    .split(/\r?\n\r?\n(?=\[Event)/)
                    .map(game => game.trim())
                    .filter(Boolean);
                setPgnList(games);
            })
            .catch(err => console.error('Error loading PGN file:', err));
    }, [pgnUrl]);

    const items = pgnList.map((pgn, idx) => {
        const metadata =  {
            event: extractTag("Event", pgn), 
            white: extractTag("White", pgn), 
            black: extractTag("Black", pgn), 
            result: extractTag("Result", pgn),
            date: extractTag("Date", pgn), 
            eco: extractTag("ECO", pgn),
        };
        const label = `${idx+1} ${metadata.eco} ${metadata.white} vs ${metadata.black} (${metadata.date})`;
        return {
            label: label,
            index: idx,
            pgn,
            metadata
        };
    });

    // console.log(items);

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(filter.toLowerCase()) ||
        item.pgn.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idx = parseInt(e.target.value, 10);
        setSelectedIndex(idx);
        const pgn = pgnList[idx];
        setSelectedPgn(pgn);
        onPgnSelect?.(pgn);
    };

    return (
        <div className='space-y-1 w-full mt-1 flex items-start gap-1'>
            <input
                type='text'
                placeholder='Filter games...'
                className='input input-sm input-bordered w-full'
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />

            <select
                className='select select-sm select-bordered w-full'
                value={selectedIndex !== undefined ? selectedIndex : ''}
                onChange={handleSelect}
            >
                <option disabled value=''>
                    Select a game
                </option>
                {filteredItems.map(item => (
                    <option key={item.index} value={item.index}>
                        {item.label}
                    </option>
                ))}
            </select>

        </div>
    );
};

export default ChessFilteredPgnDropdown;

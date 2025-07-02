import React, { useState, useEffect } from 'react';
import { copyToClipboard } from "../utils/chess";

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

    // Begin: PGN Header Parsing

    // 1) Define the shape of what you’ll return:
    interface PGNMetadata {
        Event: string;
        White: string;
        Black: string;
        Result: string;
        DateEvent: string;
        ECO: string;
    }

    // 2) (Optionally) define a generic map for any tag → value you might capture:
    type HeaderMap = Record<string, string>;

    const parsePGNHeaders = (pgnText: string): PGNMetadata => {
        // 3) You can annotate the regex if you like, though TS will infer it:
        const headerRegex = /^\[([A-Za-z0-9_]+)\s+"([^"]*)"\]$/gm;

        // 4) Give `headers` an index signature so you can do headers[someKey] = someValue
        const headers: HeaderMap = {};

        // 5) Declare `match` with the right union type
        let match: RegExpExecArray | null;

        // 6) Loop & fill your map
        while ((match = headerRegex.exec(pgnText)) !== null) {
            // match[1] is the tag, match[2] is the value
            headers[match[1]] = match[2];
        }

        // 7) Return exactly the four you care about, using nullish coalescing
        return {
            Event: headers.Event ?? '',
            White: headers.White ?? '',
            Black: headers.Black ?? '',
            Result: headers.Result ?? '',
            DateEvent: headers.Date ?? '',
            ECO: headers.ECO ?? '',
        };
    };

    // END: PGN Header Parsing

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
        const metadata = parsePGNHeaders(pgn);
        const label = `${metadata.ECO} ${metadata.White} vs ${metadata.Black} (${metadata.DateEvent})`;
        return {
            label: label, // `Game ${idx + 1}`,
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
        <div className='space-y-2 w-full mt-4 flex items-start gap-2'>
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

            {/* {false && (
                <>
                    <button onClick={() => copyToClipboard(selectedPgn)} className="btn btn-outline btn-sm">
                        Copy PGN
                    </button>
                    
                </>

            )} */}
        </div>
    );
};

export default ChessFilteredPgnDropdown;

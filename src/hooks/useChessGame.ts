import { useCallback, useEffect, useState } from "react";
import { parsePgn, normalizeAnalysis, extractTag } from "../utils/chess";
import type { MoveAnalysis, PgnMeta } from "../types/chess";

export const useChessGame = () => {
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [selectedGameUrl, setSelectedGameUrl] = useState("");
  const [search, setSearch] = useState("");
  const [pgn, setPgn] = useState("");
  const [meta, setMeta] = useState<PgnMeta>({});
  const [currentFen, setCurrentFen] = useState("");
  const [currentTurn, setCurrentTurn] = useState<"w" | "b" | null>(null);
  const [analysis, setAnalysis] = useState<MoveAnalysis[] | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingAn, setLoadingAn] = useState(false);
  const [showVariationPanel, setShowVariationPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      setLoadingGames(true);
      setError(null);
      try {
        // const arcRes = await fetch(
        //   "https://api.chess.com/pub/player/gmmelik/games/archives"
        // );
        // if (!arcRes.ok) throw new Error("Failed to fetch archives");
        // const { archives } = await arcRes.json();

        // const cutoff = new Date();
        // cutoff.setMonth(cutoff.getMonth() - 3);

        // const collected: any[] = [];
        // for (const url of archives.slice().reverse()) {
        //   const [year, month] = url.split("/").slice(-2).map(Number);
        //   if (new Date(year, month - 1, 1) < cutoff) break;
        //   try {
        //     const res = await fetch(url);
        //     if (res.ok) collected.push(...(await res.json()).games);
        //   } catch {}
        // }

        // const arcRes = await fetch("https://project.icaro.com.au/chess-com.json");
        const arcRes = await fetch("/chess-com-logical-chess.json");
        if (!arcRes.ok) throw new Error("Failed to fetch games");
        const collected: any[] = await arcRes.json();

        // console.log(collected);
        setGamesList(collected);
        if (collected.length > 0) {
          const randomIndex = Math.floor(Math.random() * collected.length);
          const randomGame = collected[randomIndex];
          setSelectedGameUrl(randomGame.url);
          setPgn(randomGame.pgn);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingGames(false);
      }
    };
    loadGames();
  }, []);

  useEffect(() => {
    if (!pgn) return;
    const { meta: m, fen, turn } = parsePgn(pgn);
    setShowVariationPanel(false);
    setMeta(m);
    setCurrentFen(fen);
    setCurrentTurn(turn);
  }, [pgn]);

  const filteredGames = gamesList.filter((g) => {
    const label = `${g.eco} ${g.white.username} vs ${g.black.username} (${extractTag("Date", g.pgn)})`;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const selectGame = (url: string) => {
    const g = gamesList.find((x) => x.url === url);
    if (g) {
      setShowVariationPanel(false);
      setSelectedGameUrl(url);
      setPgn(g.pgn);
    }
  };

  const handlePositionChange = (fen: string) => {
    setShowVariationPanel(false);
    setCurrentFen(fen);
    setCurrentTurn(parsePgn(`[FEN "${fen}"]`).turn);
  };

  const analyse = useCallback(async () => {
    if (!currentFen) return null;
    setLoadingAn(true);
    setError(null);
    try {
      const res = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: currentFen, depth: 18, maxThinkingTime: 100 }),
      });
      if (!res.ok) throw new Error(`Analysis API failed (${res.status})`);
      const data = await res.json();
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.moves)
        ? data.moves
        : [data];
      console.log('analyze', arr);
      const norm = arr.map(normalizeAnalysis);
      setAnalysis(norm);
      setShowVariationPanel(true);
      return norm;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoadingAn(false);
    }
  }, [currentFen]);

  return {
    pgn,
    setPgn,
    meta,
    currentFen,
    currentTurn,
    analysis,
    loadingAn,
    error,
    filteredGames,
    search,
    setSearch,
    selectedGameUrl,
    selectGame,
    loadingGames,
    handlePositionChange,
    analyse,
    showVariationPanel,
  };
};

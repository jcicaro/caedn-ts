// AutoPlayButton.tsx
import React, { useState, useRef, useEffect } from 'react';

export function ChessBoardAutoPlayButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Finds and clicks your “Next move” button
  const clickNext = () => {
    const btn = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Next move"]'
    );
    if (btn && !btn.disabled) {
      btn.click();
    }
  };

  // Toggle auto-play on/off
  const toggleAutoPlay = () => {
    if (!isPlaying) {
      intervalRef.current = window.setInterval(clickNext, 2000);
      setIsPlaying(true);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      onClick={toggleAutoPlay}
      className="btn btn-outline btn-sm filter grayscale"
      aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
    >
      {isPlaying ? '⏸️' : '▶️'}
    </button>
  );
}

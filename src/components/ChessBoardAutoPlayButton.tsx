// AutoPlayButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export function ChessBoardAutoPlayButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Finds and clicks your “Next move” button,
  // but also auto-pauses if it becomes disabled.
  const clickNext = () => {
    const btn = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Next move"]'
    );
    if (!btn) return;

    if (btn.disabled) {
      // Pause auto-play when the button is no longer enabled
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
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
      className="btn btn-outline btn-sm"
      aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
    >
      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
    </button>
  );
}

import React, { useRef, useEffect } from 'react';

export interface TTSControlsProps {
  loading: boolean;
  error: string;
  audioUrl: string;
  onGenerate: () => void;
}

const TTSControls: React.FC<TTSControlsProps> = ({ loading, error, audioUrl, onGenerate }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      void audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="flex items-center space-x-2">
        <button
          className={`btn btn-sm ${loading ? 'loading' : ''}`}
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? 'Gen…' : '🔈'}
        </button>

        {audioUrl && (
          <audio
            ref={audioRef}
            key={audioUrl}
            src={audioUrl}
            controls
            className="h-8"
          />
        )}
      </div>

      {error && <div className="text-error text-sm text-center">Error: {error}</div>}
    </div>
  );
};

export default TTSControls;

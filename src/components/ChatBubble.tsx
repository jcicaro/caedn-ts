import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ChatMessage } from '../services/openaiService';
import TTSControls from './TtsControls';

/**
 * Renders a chat message bubble with improved layout and usability.
 * - Wraps content and controls in a flex column for consistent spacing.
 * - Constrains max width for better readability on larger screens.
 * - Adds padding, rounded corners, and subtle shadow to bubbles.
 * - Aligns bubbles and controls based on message role.
 */
export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  // TTS state for assistant messages
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Generate speech for this message
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setAudioUrl('');
    try {
      const res = await fetch('https://tts.icaro.com.au/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer your_api_key_here`,
        },
        body: JSON.stringify({ model: 'tts-1', input: msg.content, voice: 'alloy' }),
        // body: JSON.stringify({ model: 'tts-1', input: msg.content, voice: 'en-US-AvaNeural' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [msg.content]);

  return (
    <li className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>      
      <div
        className={`flex flex-col space-y-2 ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        
        {/* TTS controls for assistant messages */}
        {!isUser && !isSystem && (
          <div className="flex justify-start mt-2">
            <TTSControls
              loading={loading}
              error={error}
              audioUrl={audioUrl}
              onGenerate={handleGenerate}
            />
          </div>
        )}
        
        <div
          className={`chat-bubble p-4 rounded-2xl shadow-md transition-colors ease-in-out
            ${isSystem
              ? 'chat-bubble-neutral'
              : isUser
              ? 'bg-secondary text-secondary-content'
              : 'bg-primary text-primary-content'
            }
          `}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>          
            {msg.content}
          </ReactMarkdown>
        </div>

        
      </div>
    </li>
  );
}

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * LunaSpeech Component (for Vite)
 *
 * Installation:
 *   npm install react-markdown remark-gfm 
 * 
 *
 * Usage in code-server environment:
 * 1. At your project root, create a `.env` file:
 *
 *    VITE_OPENAI_API_KEY=your-api-key
 *    VITE_OPENAI_BASE_URL=https://api.openai.com/v1
 *    VITE_OPENAI_MODEL=gpt-3.5-turbo
 *
 * 2. Restart your Vite dev server.
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL;
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL;

// Set your initial prompt here:
const INITIAL_PROMPT = "Hello, I am Luna. Write a Year 1 speech for me about something interesting for primary schoolers? It should have an Introduction, 3 main points, and a conclusion. Also add a 'secret sauce' to make it interesting. Make it very short and easy to read.";

export default function LunaSpeech() {
  // Start with empty history
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChat = async (userMessage) => {
    setLoading(true);
    setError(null);
    try {
      // Build context: existing messages plus this new user message
      const context = [...messages, { role: 'user', content: userMessage }];
      const payload = { model: OPENAI_MODEL, messages: context };

      const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response';

      // Append assistant reply after context
      setMessages([...context, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount: send the initial prompt
  useEffect(() => {
    fetchChat(INITIAL_PROMPT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    fetchChat(input);
    setInput('');
  };

  return (
    // <div className="p-6 max-w-2xl mx-auto">
    //   <ul className="chat flex flex-col space-y-2">
    //     {messages.map((msg, idx) => (
    //       <li key={idx} className={msg.role === 'user' ? 'chat-end' : 'chat-start'}>
    //         <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>
    //           <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
    //         </div>
    //       </li>
    //     ))}
    //     {loading && (
    //       <li className="chat-start">
    //         <div className="chat-bubble loading">Loading...</div>
    //       </li>
    //     )}
    //   </ul>

    //   {error && <div className="text-red-500 mt-4">{error}</div>}

    //   <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
    //     <input
    //       type="text"
    //       placeholder="Type your message..."
    //       value={input}
    //       onChange={(e) => setInput(e.target.value)}
    //       className="input input-bordered flex-1"
    //       disabled={loading}
    //     />
    //     <button type="submit" className="btn btn-primary" disabled={loading}>
    //       {loading ? 'Sending...' : 'Send'}
    //     </button>
    //   </form>
    // </div>

    <div className="p-6 max-w-2xl mx-auto">
      <ul className="chat flex flex-col space-y-2">
        {messages.map((msg, idx) => (
          <li key={idx} className={msg.role === 'user' ? 'chat-end' : 'chat-start'}>
            <div
              className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-secondary text-white' : 'chat-bubble-primary text-white'}`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          </li>
        ))}
        {loading && (
          <li className="flex items-center justify-center h-screen">
            <div className="chat-bubble loading">...</div>
          </li>
        )}
      </ul>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input input-bordered flex-1"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

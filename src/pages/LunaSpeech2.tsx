import React from "react";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

const INITIAL_PROMPT = `
The user's name is Luna.
Write a Year 1 speech for about something interesting for primary schoolers? 
It should have an Introduction, 3 main points, a "secret sauce" to make it more engaging, and a conclusion. 
Use simple, easy-to-read language.
At the end, ask Luna if she wants another speech about another subject.
`.trim();

export default function LunaSpeech2() {
  const { messages, loading: chatLoading, error: chatError, send } = useChat(
    INITIAL_PROMPT,
    import.meta.env.VITE_OPENAI_MODEL
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">
        Luna's Speech Playground
      </h1>

      <ul className="chat flex flex-col space-y-2">
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} />
        ))}

        {chatLoading && (
          <li className="flex items-center justify-center h-16">
            <div className="chat-bubble loading">...</div>
          </li>
        )}
      </ul>

      <div className="mt-2 flex space-x-2">
        {["simplify", "expand", "another"].map((cmd) => (
          <button
            key={cmd}
            className="btn btn-xs btn-info btn-outline"
            onClick={() => send(cmd)}
            disabled={chatLoading}
          >
            {cmd.charAt(0).toUpperCase() + cmd.slice(1)}
          </button>
        ))}
      </div>

      {chatError && <div className="text-red-500 mt-4">{chatError}</div>}

      <ChatInput onSend={send} disabled={chatLoading} />
    </div>
  );
}

import React from "react";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";

interface Props {
  messages: any[];
  loading: boolean;
  error: string | null;
  onSend: (t: string) => void;
}

export const CoachChat: React.FC<Props> = ({ messages, loading, error, onSend }) => (
  <div className="card bg-base-100 shadow-xl flex-1 overflow-hidden">
    <div className="card-body p-4 flex flex-col h-full">
      <h2 className="text-2xl font-semibold mb-2">Coach Chat</h2>
      <ul
        className="chat flex-1 overflow-y-auto space-y-2 pr-2 break-all"
        style={{ ["--chat-bubble-max-width" as any]: "95%" }}
      >
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} />
        ))}
        {loading && (
          <li className="flex items-center justify-center h-12">
            <div className="chat-bubble loading">…</div>
          </li>
        )}
      </ul>
      <ChatInput onSend={onSend} disabled={loading} />
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  </div>
);
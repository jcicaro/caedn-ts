import React, { useRef, useEffect } from "react";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";

interface Props {
  messages: any[];
  loading: boolean;
  error: string | null;
  onSend: (t: string) => void;
}

export const ChessCoachChat: React.FC<Props> = ({ messages, loading, error, onSend }) => {
  // Approach A: scroll the container itself
  const listRef = useRef<HTMLUListElement>(null);

  // Approach B: scroll a dummy “anchor” element at the bottom
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A: scroll the UL
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    // B: or scroll the bottom marker into view
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, loading]);

  return (
    <div className="card bg-base-100 shadow-xl flex-1 overflow-hidden" style={{["z-index" as any]: "-10"}}>
      <div className="card-body p-4 flex flex-col h-full">
        {/* <h1 className="text-2xl font-semibold mb-2">Chess Buddy</h1> */}

        <ul
          ref={listRef}                             // ← for Approach A
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

          {/* dummy element to scroll into view for Approach B */}
          <div ref={bottomRef} />
        </ul>

        <ChatInput onSend={onSend} disabled={loading} />
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
};

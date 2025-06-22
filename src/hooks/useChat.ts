// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchChatCompletion, ChatMessage } from "../services/openaiService";

export function useChat(initialPrompt: string, model: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: initialPrompt }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // 1️⃣ a ref, NOT a state setter
  const initializedRef = useRef(false);

  // 2️⃣ run once on mount
  useEffect(() => {
    // ❌ make sure this is `initializedRef.current` (a boolean),
    // not `initializedRef` or `initializedRef()`
    if (initializedRef.current) return;

    initializedRef.current = true;  // ← NO parentheses here!

    (async () => {
      setLoading(true);
      try {
        const reply = await fetchChatCompletion(model, messages);
        setMessages((prev) => [...prev, reply]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3️⃣ user‐triggered send
  const send = useCallback(
    async (userContent: string) => {
      setLoading(true);
      setError(null);

      const userMsg: ChatMessage = { role: "user", content: userContent };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const assistantMsg = await fetchChatCompletion(model, [
          ...messages,
          userMsg,
        ]);
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [messages, model]
  );

  return { messages, loading, error, send };
}

// components/ChatInput.tsx
import React, { FormEvent, useState } from "react";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form onSubmit={submit} className="mt-4 flex space-x-2">
      <input
        className="input input-bordered flex-1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder="Type your message…"
      />
      <button className="btn btn-primary" disabled={disabled}>
        {disabled ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

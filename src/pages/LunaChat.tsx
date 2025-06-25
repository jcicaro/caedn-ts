// src/pages/LunaChat.tsx
import React from "react"
import { ChatBubble } from "../components/ChatBubble"
import { ChatInput }  from "../components/ChatInput"
import { useChat }    from "../hooks/useChat"

// const INITIAL_PROMPT = `
// Hello, Luna is my name.
// Teach me about something interesting for primary schoolers?
// Make it very easy to understand.
// Make it easy to read for Year 1 students.
// `.trim()

const INITIAL_PROMPT = `
The user's name is Luna.
Write a short and fun explanation of an interesting topic for a Year 1 student.
Use simple words and short sentences so it's easy for young children to understand.
Include a few cute or fun examples to help explain the topic. Also include emojis to make it visual.
At the end, ask Luna if she wants to learn more about something else.
`.trim()

export default function LunaChat() {
  const { messages, loading, error, send } = useChat(
    INITIAL_PROMPT,
    import.meta.env.VITE_OPENAI_MODEL
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">
        Luna's Curiosity Chat
      </h1>

      <ul className="chat flex flex-col space-y-2">
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} />
        ))}

        {loading && (
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
            disabled={loading}
          >
            {cmd.charAt(0).toUpperCase() + cmd.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      <ChatInput onSend={send} disabled={loading} />
    </div>
  )
}

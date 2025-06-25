// src/pages/JcProgrammingCheatsheet.tsx
import React from "react"
import { ChatBubble } from "../components/ChatBubble"
import { ChatInput }  from "../components/ChatInput"
import { useChat }    from "../hooks/useChat"


const INITIAL_PROMPT = `
Write a self-contained Typescript module that demonstrates the key language features of that programming language, each with a short comment explaining the concept. 
At the end, ask the user about another programming language or whether to simplify or expand on the topics shown.
`.trim()

export default function JcProgrammingCheatsheet() {
  const { messages, loading, error, send } = useChat(
    INITIAL_PROMPT,
    import.meta.env.VITE_OPENAI_MODEL
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">
        JC's Programming Cheatsheets
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
        {["es6 and beyond", "python 3", "powershell"].map((cmd) => (
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


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
Write a very short narrative for Year 1 primary schoolers. 
The story should include and clearly label an Orientation, a Complication, a "secret sauce" to make it more engaging, and a Resolution. 
Use simple, easy-to-read language.
Also include emojis to make it visual.
At the end, ask Luna if she wants to another narrative about another subject.
`.trim()

export default function LunaNarrative2() {
  const { messages, loading, error, send } = useChat(
    INITIAL_PROMPT,
    import.meta.env.VITE_OPENAI_MODEL
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">
        Luna’s Narrative
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

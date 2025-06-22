// src/components/ChatBubble.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatMessage } from '../services/openaiService'

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'

  return (
    <li className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-bubble ${
          isUser
            ? 'bg-secondary text-secondary-content'
            : 'bg-primary text-primary-content'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {msg.content}
        </ReactMarkdown>
      </div>
    </li>
  )
}

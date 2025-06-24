import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight';
import { ChatMessage } from '../services/openaiService'

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  return (
    <li className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      <div
        className={`chat-bubble ${
          isSystem
            ? 'chat-bubble-neutral'
            : isUser
              ? 'bg-secondary text-secondary-content'
              : 'bg-primary text-primary-content'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {msg.content}
        </ReactMarkdown>
      </div>
    </li>
  )
}

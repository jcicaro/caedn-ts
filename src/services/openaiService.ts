// services/openaiService.ts
// import { getEnv } from "../utils/env";

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL;
// const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function fetchChatCompletion(
  model: string,
  messages: ChatMessage[]
): Promise<ChatMessage> {
  // console.log(model, messages)
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return { role: "assistant", content };
}

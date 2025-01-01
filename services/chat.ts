import type { Message, ChatResponse, ChatRequest } from "@/types/chat";

export async function sendChatMessage(message: string, history: Message[]): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      message,
      history 
    } as ChatRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
}

export function formatChatMessage(response: ChatResponse): Message {
  return {
    content: response.message,
    role: "assistant",
    timestamp: new Date(),
    type: response.type,
    data: response.data,
  };
} 
import type { Message, ChatResponse, ChatRequest } from "@/types/chat";

export async function sendChatMessage(
  message: string,
  history: Message[],
  onChunk?: (chunk: string) => void
): Promise<ChatResponse> {
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

  if (!response.body) {
    throw new Error('No response body received');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'end') {
            return {
              message: result,
              type: "stream",
              data: data
            };
          } else if (data.message) {
            result += data.message;
            onChunk?.(data.message);
          }
        }
      }
    }
  } catch (error) {
    throw new Error('Failed to read streaming response');
  }

  return {
    message: result || "No response received",
    type: "stream",
    data: null
  };
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
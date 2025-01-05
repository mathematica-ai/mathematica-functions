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
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'error') {
              throw new Error(data.message || 'Stream error');
            }

            if (data.type === 'chunk' && data.data?.content) {
              result += data.data.content;
              onChunk?.(data.data.content);
            }

            if (data.type === 'done') {
              return {
                message: result,
                type: "text",
                data: null
              };
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }

  if (!result) {
    throw new Error('No response received');
  }

  return {
    message: result,
    type: "text",
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
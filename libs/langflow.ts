import axios from "axios";
import type { Message } from "@/types/chat";

const langflowClient = axios.create({
  baseURL: process.env.LANGFLOW_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface LangflowTweaks {
  "ChatInput-0gu7k": Record<string, never>;
  "Prompt-wxWR6": Record<string, never>;
  "OpenAIModel-A33nr": Record<string, never>;
  "ChatOutput-uJy4V": Record<string, never>;
}

export interface LangflowResponse {
  message: string;
  type: string;
  data?: any;
}

export async function sendMessageToLangflow(
  message: string,
  history: Message[],
  workflow_id: string,
  streaming: boolean = false,
  onChunk?: (chunk: string) => void
): Promise<LangflowResponse> {
  try {
    // Format history for Langflow
    const formattedHistory = history.map(msg => ({
      content: msg.content,
      role: msg.role,
    }));

    // Concatenate formatted history with the user message
    const fullContext = formattedHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') + `\nUser: ${message}`;

    if (!streaming) {
      // Non-streaming response
      const response = await langflowClient.post(
        `/${workflow_id}?stream=false`,
        {
          input_value: fullContext,
          output_type: "chat",
          input_type: "chat",
          conversation_history: formattedHistory
        }
      );

      console.log('Non-streaming response:', response.data);

      const aiMessage = response.data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
        response.data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
        "No response received";

      return {
        message: aiMessage,
        type: "text",
        data: response.data
      };
    } else {
      // Use the workflow-specific endpoint with streaming
      const response = await fetch(`${process.env.LANGFLOW_API_URL}/${workflow_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          input_value: fullContext,
          output_type: "chat",
          input_type: "chat",
          conversation_history: formattedHistory,
          tweaks: {
            "ChatInput-0gu7k": {},
            "Prompt-wxWR6": {},
            "OpenAIModel-A33nr": {
              "model_name": "gpt-3.5-turbo",
              "temperature": 0.7,
              "stream": true,
              "max_tokens": 2000,
              "chunk_size": 20,
              "chunk_overlap": 0
            },
            "ChatOutput-uJy4V": {
              "allow_markdown": true,
              "format_markdown": true
            }
          },
          stream: true,
          session_id: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let messageCount = 0;

      console.log('=== Starting Langflow Stream ===');
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('=== Stream Complete ===');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          messageCount++;
          console.log(`\n=== Message ${messageCount} ===`);
          console.log('Raw chunk:', chunk);

          try {
            const data = JSON.parse(chunk);
            console.log('Parsed data structure:', JSON.stringify(data, null, 2));
            
            // Check for streaming response format
            if (data.type === 'stream' && data.message) {
              console.log('Streaming message:', data.message);
              onChunk?.(data.message);
              result += data.message;
              continue;
            }

            // Extract message and formatting properties
            const messageData = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data;
            const message = messageData?.text || 
                          data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
                          data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
                          '';
            
            // Check if markdown is allowed
            const allowMarkdown = messageData?.properties?.allow_markdown || 
                                data?.outputs?.[0]?.outputs?.[0]?.results?.message?.properties?.allow_markdown;

            if (message) {
              console.log('Standard message:', message);
              console.log('Markdown allowed:', allowMarkdown);
              onChunk?.(message);
              result = message;
            }
          } catch (error: unknown) {
            if (error instanceof Error) {
              console.log('Failed to parse chunk as JSON:', error.message);
            }
            // Try to extract any text content from partial JSON
            const textMatch = chunk.match(/"text":"([^"]*)"|"message":"([^"]*)"/);
            if (textMatch) {
              const newText = textMatch[1] || textMatch[2];
              if (newText && !result.includes(newText)) {
                console.log('Extracted text:', newText);
                onChunk?.(newText);
                result += newText;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error during streaming:', error);
      }

      console.log('=== Stream Summary ===');
      console.log('Total messages received:', messageCount);
      console.log('Final result:', result);

      return {
        message: result || "No response received",
        type: "stream",
        data: null
      };
    }
  } catch (error: any) {
    console.error('Langflow API Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to communicate with Langflow');
  }
} 
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

export async function sendMessageToLangflow(message: string, history: Message[]): Promise<LangflowResponse> {
  try {
    // Format history for Langflow
    const formattedHistory = history.map(msg => ({
      content: msg.content,
      role: msg.role,
      // Add any additional metadata Langflow needs
    }));

    // Concatenate formatted history with the user message
    const fullContext = formattedHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') + `\nUser: ${message}`;

    const payload = {
      input_value: fullContext, // Use full context as input value
      output_type: "chat",
      input_type: "chat",
      conversation_history: formattedHistory, // Add history to payload
      tweaks: {
        "ChatInput-0gu7k": {},
        "Prompt-wxWR6": {
          // You might want to format the history into the prompt
          history: formattedHistory
        },
        "OpenAIModel-A33nr": {},
        "ChatOutput-uJy4V": {}
      }
    };

    const response = await langflowClient.post(
      `${process.env.LANGFLOW_FLOW_ID}?stream=false`, 
      payload
    );

    const aiMessage = response.data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message || 
                     response.data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
                     "No response received";

    return {
      message: aiMessage,
      type: "text",
      data: response.data
    };
  } catch (error) {
    console.error('Langflow API Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to communicate with Langflow');
  }
} 
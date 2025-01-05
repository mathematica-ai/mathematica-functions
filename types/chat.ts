export type MessageRole = "user" | "assistant";
export type MessageType = "text" | "image" | "error" | "stream";

export interface Message {
  content: string;
  role: MessageRole;
  timestamp: Date;
  type?: MessageType;
  data?: any;
}

export interface ChatResponse {
  message: string;
  type: MessageType;
  data: any;
}

export interface ChatRequest {
  message: string;
  history?: Message[];
} 
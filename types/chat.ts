export interface Message {
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type?: string;
  data?: any;
}

export interface ChatResponse {
  message: string;
  type?: string;
  data?: any;
}

export interface ChatRequest {
  message: string;
  history: Message[];
} 
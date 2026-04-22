export interface ChatRequest {
  message: string;
  aquariumId?: number | null;
}

export type ChatErrorCode =
  | 'GEMINI_ERROR'
  | 'GEMINI_UNAVAILABLE'
  | 'INVALID_REQUEST';

export interface ChatResponse {
  reply: string;
  errorCode?: ChatErrorCode | null;
}

export interface ChatUsageResponse {
  used: number;
  limit: number; // -1 = unlimited (REEFMASTER)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

import api from './axiosConfig';
import type { ChatRequest, ChatResponse, ChatUsageResponse } from '../types/chat';

export const chatApi = {
  sendMessage: (data: ChatRequest) =>
    api.post<ChatResponse>('/chat', data).then((r) => r.data),

  getUsage: () =>
    api.get<ChatUsageResponse>('/chat/usage').then((r) => r.data),
};

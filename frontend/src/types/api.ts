export interface ApiError {
  message: string;
  status?: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  plan: 'FREE' | 'REEFMASTER';
}

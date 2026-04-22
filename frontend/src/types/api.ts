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
  subscriptionPlan: 'FREE' | 'REEFMASTER';
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  subscriptionPlan: 'FREE' | 'REEFMASTER';
  electricityPriceKwh?: number | null;
  locale?: string | null;
  temperatureUnit?: string | null;
  volumeUnit?: string | null;
}

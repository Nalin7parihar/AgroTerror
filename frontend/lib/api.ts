// API utility functions for making authenticated requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail: string;
  status?: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') 
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }));
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export interface LLMQueryRequest {
  question: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  language: 'en' | 'hi' | 'kn';
  allow_code_mixing?: boolean;
}

export interface LLMQueryResponse {
  answer: string;
  question: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  language: 'en' | 'hi' | 'kn';
}

export async function queryLLM(request: LLMQueryRequest): Promise<LLMQueryResponse> {
  return apiRequest<LLMQueryResponse>('/llm/query', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Auth API functions
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export async function register(request: RegisterRequest): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getCurrentUser(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/me');
}

// Auth token management
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}


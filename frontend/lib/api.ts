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
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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

// Gene Analysis API functions
export interface GeneAnalysisRequest {
  dna_sequence: string;
  target_trait: 'plant_height' | 'leaf_color' | 'flowering_time' | 'yield' | 'disease_resistance' | 'drought_tolerance' | 'custom';
  target_region?: string;
  max_suggestions?: number;
  min_efficiency?: number;
  dataset_name?: string;
  dataset_category?: string;
}

export interface EditSuggestion {
  guide_rna: string;
  target_position: number;
  edit_type: string;
  efficiency_score: number;
  confidence: number;
  original_base?: string;
  target_base?: string;
}

export interface DNABERTValidation {
  original_score: number;
  mutated_score: number;
  difference: number;
  log_odds_ratio: number;
  validation_passed: boolean;
  mutation_position: number;
}

export interface SNPChange {
  snp_id: string;
  chromosome: string;
  position: number;
  original_allele: string;
  new_allele: string;
  effect_size: number;
  is_causal_candidate: boolean;
  nearby_genes: string[];
  dnabert_score?: number;
}

export interface EditSummary {
  total_snps_affected: number;
  high_impact_snps: number;
  causal_candidate_snps: SNPChange[];
  trait_prediction_change: number;
  risk_assessment: string;
  overall_confidence: number;
}

export interface GeneAnalysisResponse {
  analysis_id: string;
  request_id: string;
  dna_sequence?: string;
  edit_suggestions: EditSuggestion[];
  dnabert_validations: DNABERTValidation[];
  snp_changes: SNPChange[];
  summary: EditSummary;
  metrics: Record<string, any>;
  created_at: string;
}

export interface AnalysisHistoryItem {
  analysis_id: string;
  dna_sequence: string;
  target_trait: string;
  dataset_name?: string;
  created_at: string;
  summary: EditSummary;
}

export interface AnalysisHistoryResponse {
  analyses: AnalysisHistoryItem[];
  total: number;
}

export async function analyzeGeneEdits(request: GeneAnalysisRequest): Promise<GeneAnalysisResponse> {
  return apiRequest<GeneAnalysisResponse>('/gene-analysis/analyze', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getAnalysisHistory(limit: number = 20, skip: number = 0): Promise<AnalysisHistoryResponse> {
  return apiRequest<AnalysisHistoryResponse>(`/gene-analysis/history?limit=${limit}&skip=${skip}`);
}

export async function getAnalysisDetail(analysisId: string): Promise<GeneAnalysisResponse> {
  return apiRequest<GeneAnalysisResponse>(`/gene-analysis/history/${analysisId}`);
}

export interface EditSummaryResponse {
  analysis_id: string;
  summary: string;
}

export async function generateEditSummary(analysisId: string): Promise<EditSummaryResponse> {
  return apiRequest<EditSummaryResponse>(`/gene-analysis/history/${analysisId}/summary`, {
    method: 'POST',
  });
}

export async function exportAnalysisReport(analysisId: string, format: 'html' | 'pdf' = 'html'): Promise<Blob> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') 
    : null;

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/gene-analysis/history/${analysisId}/report?format=${format}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // If response is not JSON, use default error message
    }
    const error: ApiError = {
      detail: errorDetail,
      status: response.status,
    };
    throw error;
  }

  // Get the blob with correct MIME type
  const contentType = response.headers.get('content-type') || (format === 'pdf' ? 'application/pdf' : 'text/html');
  const blob = await response.blob();
  
  // Return blob with correct type
  return new Blob([blob], { type: contentType });
}


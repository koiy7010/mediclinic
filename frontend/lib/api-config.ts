// API Configuration
export const API_CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',
  TIMEOUT: 30000, // 30 seconds
} as const;

// Common headers for API requests
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  // Add authentication headers here when needed
  // 'Authorization': `Bearer ${token}`,
});

// Error response type
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

// Common API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

// Pagination response type (matches backend PagedResponse)
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
  }
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

// Helper function to build query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}
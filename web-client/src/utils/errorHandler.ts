import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}

export interface ErrorHandlerResult {
  message: string;
  isRetryable: boolean;
  shouldRedirect: boolean;
  redirectPath?: string;
}

/**
 * Centralized error handler for API responses
 * Provides consistent error messages and handling strategies
 */
export function handleApiError(error: unknown): ErrorHandlerResult {
  console.error('API Error:', error);
  
  // Handle network errors (no response)
  if (!error || typeof error !== 'object') {
    return {
      message: 'An unexpected error occurred. Please try again.',
      isRetryable: true,
      shouldRedirect: false,
    };
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;
  
  // Network error (no response received)
  if (!axiosError.response) {
    if (axiosError.code === 'NETWORK_ERROR' || axiosError.code === 'ERR_NETWORK') {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        isRetryable: true,
        shouldRedirect: false,
      };
    }
    
    if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
      return {
        message: 'Request timeout. The server is taking too long to respond.',
        isRetryable: true,
        shouldRedirect: false,
      };
    }
    
    return {
      message: 'Unable to connect to the server. Please try again later.',
      isRetryable: true,
      shouldRedirect: false,
    };
  }

  const status = axiosError.response.status;
  const responseData = axiosError.response.data;
  
  console.error('Response status:', status);
  console.error('Response data:', responseData);

  switch (status) {
    case 400:
      return {
        message: responseData?.message || 'Invalid request. Please check your input and try again.',
        isRetryable: false,
        shouldRedirect: false,
      };
      
    case 401:
      return {
        message: 'Authentication required. Please log in and try again.',
        isRetryable: false,
        shouldRedirect: true,
        redirectPath: '/login',
      };
      
    case 403:
      return {
        message: 'Access denied. You don\'t have permission to perform this action.',
        isRetryable: false,
        shouldRedirect: false,
      };
      
    case 404:
      return {
        message: responseData?.message || 'The requested resource was not found.',
        isRetryable: false,
        shouldRedirect: false,
      };
      
    case 409:
      return {
        message: responseData?.message || 'Conflict detected. The resource may have been modified.',
        isRetryable: false,
        shouldRedirect: false,
      };
      
    case 422:
      return {
        message: responseData?.message || 'Validation failed. Please check your input.',
        isRetryable: false,
        shouldRedirect: false,
      };
      
    case 429:
      return {
        message: 'Too many requests. Please wait a moment before trying again.',
        isRetryable: true,
        shouldRedirect: false,
      };
      
    case 500:
      return {
        message: 'Internal server error. Our team has been notified. Please try again later.',
        isRetryable: true,
        shouldRedirect: false,
      };
      
    case 502:
      return {
        message: 'Bad gateway. The server is temporarily unavailable. Please try again in a few moments.',
        isRetryable: true,
        shouldRedirect: false,
      };
      
    case 503:
      return {
        message: 'Service temporarily unavailable. The server is under maintenance or overloaded. Please try again in a few minutes.',
        isRetryable: true,
        shouldRedirect: false,
      };
      
    case 504:
      return {
        message: 'Gateway timeout. The server is taking too long to respond. Please try again later.',
        isRetryable: true,
        shouldRedirect: false,
      };
      
    default:
      return {
        message: responseData?.message || `Server error (${status}). Please try again later.`,
        isRetryable: status >= 500,
        shouldRedirect: false,
      };
  }
}

/**
 * Enhanced error handler with retry logic for specific operations
 */
export function handleApiErrorWithRetry(
  error: unknown,
  operation: string = 'operation'
): ErrorHandlerResult {
  const result = handleApiError(error);
  
  // Customize messages for specific operations
  if (result.isRetryable) {
    result.message = `Failed to ${operation}. ${result.message}`;
  } else {
    result.message = `Unable to ${operation}. ${result.message}`;
  }
  
  return result;
}

/**
 * Check if an error is a service unavailable error (503)
 */
export function isServiceUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const axiosError = error as AxiosError;
  return axiosError.response?.status === 503;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const result = handleApiError(error);
  return result.isRetryable;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown, defaultMessage?: string): string {
  const result = handleApiError(error);
  return result.message || defaultMessage || 'An error occurred';
}
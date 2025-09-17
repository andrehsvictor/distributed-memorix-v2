import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleApiErrorWithRetry } from '../utils/errorHandler';
import type { ErrorHandlerResult } from '../utils/errorHandler';

interface UseErrorHandlerOptions {
  onRetryableError?: () => void;
}

interface UseErrorHandlerReturn {
  error: string | null;
  isRetryable: boolean;
  handleError: (error: unknown, operation?: string) => void;
  clearError: () => void;
  retry: () => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { onRetryableError } = options;
  
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [errorResult, setErrorResult] = useState<ErrorHandlerResult | null>(null);

  const handleError = useCallback((error: unknown, operation: string = 'perform this action') => {
    const result = handleApiErrorWithRetry(error, operation);
    
    setError(result.message);
    setErrorResult(result);
    
    // Handle redirection if needed
    if (result.shouldRedirect && result.redirectPath) {
      setTimeout(() => {
        navigate(result.redirectPath!);
      }, 2000); // Give user time to read the message
    }
    
    // Call retry callback if error is retryable
    if (result.isRetryable && onRetryableError) {
      onRetryableError();
    }
  }, [navigate, onRetryableError]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorResult(null);
  }, []);

  const retry = useCallback(() => {
    if (onRetryableError) {
      clearError();
      onRetryableError();
    }
  }, [clearError, onRetryableError]);

  return {
    error,
    isRetryable: errorResult?.isRetryable || false,
    handleError,
    clearError,
    retry,
  };
}

export default useErrorHandler;
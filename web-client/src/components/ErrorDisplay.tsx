import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  Error,
  Refresh,
  Warning,
  CloudOff,
} from '@mui/icons-material';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  isRetryable?: boolean;
  isAutoRetrying?: boolean;
  autoRetryCountdown?: number;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  isRetryable = true,
  isAutoRetrying = false,
  autoRetryCountdown,
  title,
}) => {
  // Determine error type based on message content
  const isServiceUnavailable = message.includes('Service temporarily unavailable') || 
                                message.includes('503') ||
                                message.includes('maintenance') ||
                                message.includes('overloaded');
  
  const isNetworkError = message.includes('Network error') ||
                         message.includes('Unable to connect') ||
                         message.includes('timeout');

  const getErrorIcon = () => {
    if (isServiceUnavailable) return <CloudOff fontSize="large" color="warning" />;
    if (isNetworkError) return <CloudOff fontSize="large" color="error" />;
    return <Error fontSize="large" color="error" />;
  };

  const getErrorSeverity = () => {
    if (isServiceUnavailable) return 'warning';
    return 'error';
  };

  const getErrorTitle = () => {
    if (title) return title;
    if (isServiceUnavailable) return 'Service Temporarily Unavailable';
    if (isNetworkError) return 'Connection Problem';
    return 'Error';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Alert 
        severity={getErrorSeverity()} 
        sx={{ 
          maxWidth: 600, 
          mb: 3,
          '& .MuiAlert-icon': {
            fontSize: '2rem',
          }
        }}
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getErrorIcon()}
          {getErrorTitle()}
        </AlertTitle>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        
        {/* Service unavailable specific info */}
        {isServiceUnavailable && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.contrastText">
              <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
              The server is currently under maintenance or experiencing high load. 
              This is usually temporary and should resolve within a few minutes.
            </Typography>
          </Box>
        )}
        
        {/* Auto retry info */}
        {isAutoRetrying && autoRetryCountdown && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">
              Automatically retrying in {autoRetryCountdown} seconds...
            </Typography>
          </Box>
        )}
      </Alert>

      {/* Retry button */}
      {onRetry && isRetryable && !isAutoRetrying && (
        <Button
          variant="contained"
          color={isServiceUnavailable ? 'warning' : 'primary'}
          startIcon={<Refresh />}
          onClick={onRetry}
          size="large"
        >
          Try Again
        </Button>
      )}
      
      {/* Additional help for service unavailable */}
      {isServiceUnavailable && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2, maxWidth: 500 }}
        >
          If this problem persists, please check our status page or try again later. 
          You can also refresh the page to check if the service is back online.
        </Typography>
      )}
    </Box>
  );
};

export default ErrorDisplay;
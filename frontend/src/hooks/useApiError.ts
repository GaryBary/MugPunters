import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const useApiError = () => {
  const handleError = useCallback((error: any, customMessage?: string) => {
    console.error('API Error:', error);
    
    let errorMessage = customMessage || 'An unexpected error occurred';
    let errorType: 'error' | 'warning' = 'error';
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Handle specific HTTP status codes
    if (error?.response?.status) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'You are not authorized. Please log in again.';
          // Redirect to login
          setTimeout(() => {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }, 2000);
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = 'Validation error. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          errorType = 'warning';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          errorType = 'warning';
          break;
        default:
          if (status >= 400 && status < 500) {
            errorMessage = 'Client error. Please check your request.';
          } else if (status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
      }
    }
    
    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      errorMessage = 'Network error. Please check your internet connection.';
      errorType = 'warning';
    }
    
    // Show toast notification
    if (errorType === 'warning') {
      toast.error(errorMessage, {
        duration: 5000,
        icon: '⚠️',
      });
    } else {
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
    
    return {
      message: errorMessage,
      status: error?.response?.status,
      code: error?.code,
    };
  }, []);
  
  const handleSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  }, []);
  
  const handleLoading = useCallback((message: string) => {
    return toast.loading(message);
  }, []);
  
  return {
    handleError,
    handleSuccess,
    handleLoading,
  };
};

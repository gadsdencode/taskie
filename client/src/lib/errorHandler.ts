/**
 * Comprehensive error handling and mapping utility for translating backend errors
 * into user-friendly messages
 */

export interface ErrorDetails {
  title: string;
  message: string;
  action?: string;
  retryable?: boolean;
  retryAfter?: number;
}

/**
 * Map of specific error patterns to user-friendly messages
 */
const ERROR_MAPPINGS: Record<string, ErrorDetails> = {
  // AI Service Errors
  'overloaded': {
    title: 'AI Service Busy',
    message: 'The AI service is currently busy. Please try again in a few minutes.',
    action: 'Consider simplifying your request or waiting before retrying.',
    retryable: true,
    retryAfter: 60
  },
  'UNAVAILABLE': {
    title: 'AI Service Unavailable',
    message: 'The AI service is temporarily unavailable. Please try again shortly.',
    action: 'The service should be back online soon.',
    retryable: true,
    retryAfter: 30
  },
  'No response candidates': {
    title: 'AI Response Failed',
    message: 'The AI couldn\'t generate a proper response. Please try rephrasing your request.',
    action: 'Try providing more details or simplifying your description.',
    retryable: true
  },
  'Empty response': {
    title: 'No AI Response',
    message: 'The AI returned an empty response. Please try again with a different description.',
    action: 'Ensure your description is clear and specific.',
    retryable: true
  },
  'AI response validation failed': {
    title: 'Invalid AI Response',
    message: 'The AI generated an invalid response. Please try with a simpler or clearer description.',
    action: 'Avoid using special characters or overly complex requirements.',
    retryable: true
  },
  'Failed to parse AI response': {
    title: 'AI Response Error',
    message: 'We couldn\'t understand the AI\'s response. The service may be experiencing issues.',
    action: 'Please wait a moment and try again.',
    retryable: true,
    retryAfter: 15
  },
  'AI response is missing required fields': {
    title: 'Incomplete AI Response',
    message: 'The AI didn\'t provide all necessary information. Please provide more details in your request.',
    action: 'Try being more specific about your project requirements.',
    retryable: true
  },

  // Rate Limiting
  'Too many project creation attempts': {
    title: 'Rate Limit Reached',
    message: 'You\'ve created too many projects recently. Please wait before creating another.',
    action: 'You can try again in 15 minutes.',
    retryable: true,
    retryAfter: 900
  },
  'Too many requests': {
    title: 'Slow Down',
    message: 'You\'re making requests too quickly. Please wait a moment.',
    action: 'Wait a few seconds before trying again.',
    retryable: true,
    retryAfter: 5
  },

  // Authentication
  'Unauthorized': {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again to continue.',
    action: 'You will be redirected to the login page.',
    retryable: false
  },
  'session has expired': {
    title: 'Session Timeout',
    message: 'Your session has timed out due to inactivity.',
    action: 'Please log in again to continue.',
    retryable: false
  },

  // Resource Errors
  'Project not found': {
    title: 'Project Not Found',
    message: 'The requested project could not be found. It may have been deleted.',
    action: 'Return to your projects list to see available projects.',
    retryable: false
  },
  'Failed to fetch project': {
    title: 'Loading Error',
    message: 'We couldn\'t load the project. Please check your connection and try again.',
    action: 'Ensure you have a stable internet connection.',
    retryable: true
  },
  'Failed to delete project': {
    title: 'Deletion Failed',
    message: 'The project couldn\'t be deleted. Please try again.',
    action: 'If the problem persists, refresh the page.',
    retryable: true
  },
  'Failed to save project': {
    title: 'Save Failed',
    message: 'Your changes couldn\'t be saved. Please try again.',
    action: 'Check your connection and retry saving.',
    retryable: true
  },

  // Validation Errors
  'Invalid project description': {
    title: 'Invalid Description',
    message: 'Please provide a valid project description.',
    action: 'Describe what you want to build in clear, simple terms.',
    retryable: false
  },
  'Description too short': {
    title: 'More Details Needed',
    message: 'Your description is too brief. Please provide more details.',
    action: 'Include specific features or requirements for your project.',
    retryable: false
  },
  'Description too long': {
    title: 'Description Too Long',
    message: 'Your description exceeds the maximum length. Please be more concise.',
    action: 'Focus on the key features and requirements.',
    retryable: false
  },

  // Network Errors
  'Network Error': {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Ensure you\'re connected to the internet and try again.',
    retryable: true
  },
  'ECONNREFUSED': {
    title: 'Server Unreachable',
    message: 'Cannot reach the server. It may be down for maintenance.',
    action: 'Please try again in a few minutes.',
    retryable: true,
    retryAfter: 60
  },
  'ETIMEDOUT': {
    title: 'Request Timeout',
    message: 'The request took too long to complete. The server may be busy.',
    action: 'Please try again with a simpler request.',
    retryable: true
  },

  // Database Errors
  'Database connection failed': {
    title: 'Database Error',
    message: 'We\'re having trouble accessing data. Please try again.',
    action: 'Our team has been notified of this issue.',
    retryable: true,
    retryAfter: 10
  },
  'Transaction failed': {
    title: 'Operation Failed',
    message: 'The operation couldn\'t be completed. Please try again.',
    action: 'If this continues, try refreshing the page.',
    retryable: true
  }
};

/**
 * Get HTTP status code specific error details
 */
function getStatusCodeError(status: number): ErrorDetails | null {
  switch (status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: 'Your request contains invalid information. Please check and try again.',
        action: 'Review your input for any errors or invalid characters.',
        retryable: false
      };
    case 401:
      return {
        title: 'Authentication Required',
        message: 'You need to be logged in to perform this action.',
        action: 'Please log in and try again.',
        retryable: false
      };
    case 403:
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        action: 'Contact support if you believe this is an error.',
        retryable: false
      };
    case 404:
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        action: 'It may have been moved or deleted.',
        retryable: false
      };
    case 429:
      return {
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please slow down.',
        action: 'Wait a moment before trying again.',
        retryable: true,
        retryAfter: 60
      };
    case 500:
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again.',
        action: 'If this persists, please contact support.',
        retryable: true
      };
    case 502:
      return {
        title: 'Gateway Error',
        message: 'We\'re having trouble connecting to our services.',
        action: 'Please wait a moment and try again.',
        retryable: true,
        retryAfter: 30
      };
    case 503:
      return {
        title: 'Service Temporarily Unavailable',
        message: 'Our service is temporarily unavailable. Please try again shortly.',
        action: 'We\'re working to restore service as quickly as possible.',
        retryable: true,
        retryAfter: 60
      };
    default:
      return null;
  }
}

/**
 * Parse error response and extract status code and message
 */
function parseErrorResponse(error: any): { status?: number; message: string; retryAfter?: number } {
  // Handle Axios-like error structure
  if (error.response) {
    const data = error.response.data;
    return {
      status: error.response.status,
      message: data?.error || data?.message || error.message || 'An error occurred',
      retryAfter: data?.retryAfter
    };
  }

  // Handle fetch-like error structure (from our apiRequest)
  if (error.message) {
    // Extract status code from error message if present (e.g., "401: Unauthorized")
    const statusMatch = error.message.match(/^(\d{3}):\s*/);
    if (statusMatch) {
      return {
        status: parseInt(statusMatch[1], 10),
        message: error.message.substring(statusMatch[0].length)
      };
    }
    return { message: error.message };
  }

  // Fallback
  return { message: String(error) };
}

/**
 * Get user-friendly error details from any error
 */
export function getErrorDetails(error: any): ErrorDetails {
  const { status, message, retryAfter } = parseErrorResponse(error);

  // First, check if any specific error pattern matches
  for (const [pattern, details] of Object.entries(ERROR_MAPPINGS)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      // Override retryAfter if provided by server
      if (retryAfter) {
        return { ...details, retryAfter };
      }
      return details;
    }
  }

  // Then check status code specific errors
  if (status) {
    const statusError = getStatusCodeError(status);
    if (statusError) {
      // Override retryAfter if provided by server
      if (retryAfter) {
        return { ...statusError, retryAfter };
      }
      return statusError;
    }
  }

  // Default error
  return {
    title: 'Something Went Wrong',
    message: message || 'An unexpected error occurred. Please try again.',
    action: 'If this problem persists, please refresh the page or contact support.',
    retryable: true
  };
}

/**
 * Format retry time for display
 */
export function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const details = getErrorDetails(error);
  return details.retryable || false;
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(error: any): number {
  const details = getErrorDetails(error);
  const seconds = details.retryAfter || 5; // Default 5 seconds
  return seconds * 1000;
}
import { AlertCircle, RefreshCw, Clock, WifiOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorDetails, formatRetryTime, type ErrorDetails } from "@/lib/errorHandler";
import { useEffect, useState } from "react";

interface ErrorDisplayProps {
  error?: any;
  message?: string;
  title?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, message, title, onRetry }: ErrorDisplayProps) {
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (error) {
      // If we have an error object with details already attached, use those
      const details = error.details || getErrorDetails(error);
      setErrorDetails(details);
      
      // Set countdown if there's a retryAfter value
      if (details.retryAfter && details.retryable) {
        setCountdown(details.retryAfter);
      }
    } else if (message) {
      // Fallback to simple message display
      setErrorDetails({
        title: title || 'Error',
        message: message,
        retryable: !!onRetry
      });
    }
  }, [error, message, title, onRetry]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (!errorDetails) return null;

  // Choose icon based on error type
  const getIcon = () => {
    if (errorDetails.title.includes('Network') || errorDetails.title.includes('Connection')) {
      return <WifiOff className="h-5 w-5" />;
    }
    if (errorDetails.title.includes('Rate') || errorDetails.title.includes('Slow')) {
      return <Clock className="h-5 w-5" />;
    }
    if (errorDetails.title.includes('AI') || errorDetails.title.includes('Service')) {
      return <AlertTriangle className="h-5 w-5" />;
    }
    return <AlertCircle className="h-5 w-5" />;
  };

  const canRetry = errorDetails.retryable && onRetry && (!countdown || countdown <= 0);

  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          {getIcon()}
          <span data-testid="text-error-title">{errorDetails.title}</span>
        </CardTitle>
        {errorDetails.message && (
          <CardDescription className="mt-2" data-testid="text-error-message">
            {errorDetails.message}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {errorDetails.action && (
          <Alert>
            <AlertDescription data-testid="text-error-action">
              {errorDetails.action}
            </AlertDescription>
          </Alert>
        )}
        
        {countdown && countdown > 0 && (
          <div className="text-sm text-muted-foreground" data-testid="text-retry-countdown">
            You can retry in {formatRetryTime(countdown)}
          </div>
        )}
        
        {canRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="w-full sm:w-auto"
            data-testid="button-retry"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
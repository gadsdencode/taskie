import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span data-testid="text-error-title">Error Generating Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed" data-testid="text-error-message">
          {message}
        </p>
        {onRetry && (
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

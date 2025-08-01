import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";

export default function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage =
      error.statusText || error.data?.message || "Something went wrong";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unexpected error occurred";
  }

  const is404 = errorStatus === 404;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">
            {errorStatus || "Error"}
          </h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {is404 ? "Page Not Found" : "Oops! Something went wrong"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {is404
              ? "The page you're looking for doesn't exist or has been moved."
              : errorMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {!is404 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Error Details:
            </h3>
            <code className="text-xs text-muted-foreground break-all">
              {errorMessage}
            </code>
          </div>
        )}

        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            If this problem persists, please{" "}
            <a
              href="mailto:support@auracampaigns.com"
              className="text-primary hover:underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

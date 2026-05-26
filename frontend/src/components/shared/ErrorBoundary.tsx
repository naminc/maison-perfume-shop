import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackClassName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
          <Card className={`w-full max-w-md border-border shadow-sm ${this.props.fallbackClassName ?? ""}`}>
            <CardContent className="flex flex-col items-center justify-center px-6 py-8 text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-foreground">Có lỗi giao diện</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Một phần giao diện vừa gặp lỗi. Bạn có thể thử lại hoặc tải lại trang.
              </p>
            {isDev && this.state.error && (
              <p className="mt-3 max-w-full rounded-md bg-muted px-3 py-2 text-left font-mono text-xs text-muted-foreground break-all">
                {this.state.error.message}
              </p>
            )}
              <div className="mt-5 flex items-center gap-2">
              <Button size="sm" variant="default" onClick={this.handleReset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Thử lại
              </Button>
              <Button size="sm" variant="ghost" onClick={this.handleReload}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Tải lại
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

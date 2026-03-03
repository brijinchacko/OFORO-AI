"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-sm font-medium mb-2">Something went wrong</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 text-sm rounded-lg"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

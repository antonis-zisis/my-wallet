import { Component, type ReactNode } from 'react';

import { Button } from './ui';

interface Props {
  children: ReactNode;
  compact?: boolean;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.compact) {
      return (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Failed to load this section.
          </p>
          <Button variant="secondary" size="sm" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
        <p className="text-8xl font-bold text-gray-200 dark:text-gray-700">!</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-8">
          <Button onClick={this.reset}>Try again</Button>
        </div>
      </div>
    );
  }
}

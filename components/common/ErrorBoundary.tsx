/**
 * ErrorBoundary Component
 * 
 * Catches React errors and displays a fallback UI instead of crashing the app.
 * Uses React Error Boundaries (lifecycle methods) to handle errors in child components.
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import React, { ErrorInfo, ReactNode } from 'react'
import { Z_INDEX, DEBUG } from '@/lib/constants'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'section' | 'component'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console in development
    if (DEBUG.CONSOLE_LOGGING) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Update state with error details
    this.setState({
      errorInfo,
    })

    // Call optional error handler callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to send error to a logging service
    // Example: sendErrorToLoggingService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          level={this.props.level || 'component'}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback UI Component
 */
interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
  level: 'page' | 'section' | 'component'
}

function ErrorFallback({
  error,
  errorInfo,
  onReset,
  level,
}: ErrorFallbackProps) {
  const isPage = level === 'page'
  const isSection = level === 'section'

  return (
    <div
      style={{
        zIndex: Z_INDEX.MODAL,
        padding: isPage ? '2rem' : '1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#fee2e2', // red-100
        border: '2px solid #dc2626', // red-600
        color: '#7f1d1d', // red-900
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h2
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: isPage ? '1.875rem' : '1.25rem',
            fontWeight: 'bold',
          }}
        >
          ⚠️ {isPage ? 'Application Error' : isSection ? 'Section Error' : 'Component Error'}
        </h2>
        <p style={{ margin: '0.5rem 0', opacity: 0.8 }}>
          {isPage
            ? 'Something went wrong. Please try refreshing the page.'
            : 'This section encountered an error. You can try resetting it.'}
        </p>
      </div>

      {/* Error details in development */}
      {DEBUG.CONSOLE_LOGGING && error && (
        <details
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Error Details</summary>
          <pre
            style={{
              margin: '0.5rem 0 0 0',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.75rem',
            }}
          >
            <strong>Message:</strong>
            {'\n'}
            {error.message}
            {'\n\n'}
            <strong>Stack:</strong>
            {'\n'}
            {error.stack}
            {errorInfo && (
              <>
                {'\n\n'}
                <strong>Component Stack:</strong>
                {'\n'}
                {errorInfo.componentStack}
              </>
            )}
          </pre>
        </details>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!isPage && (
          <button
            onClick={onReset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c'
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626'
            }}
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4b5563'
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6b7280'
          }}
        >
          {isPage ? 'Refresh Page' : 'Go Home'}
        </button>
      </div>
    </div>
  )
}

/**
 * Hook for catching async errors (not caught by Error Boundaries)
 * 
 * Use this in combination with ErrorBoundary for complete error coverage.
 * 
 * @example
 * ```tsx
 * export default function MyComponent() {
 *   const handleAsyncError = useAsyncErrorHandler()
 *   
 *   const fetchData = async () => {
 *     try {
 *       // ... async operation
 *     } catch (error) {
 *       handleAsyncError(error as Error)
 *     }
 *   }
 * 
 *   return <button onClick={fetchData}>Load</button>
 * }
 * ```
 */
export function useAsyncErrorHandler() {
  return (error: Error) => {
    // Dispatch error to parent error boundary via custom error event
    setTimeout(() => {
      throw error
    }, 0)
  }
}

/**
 * Higher-order component to wrap async functions with error handling
 * 
 * @example
 * ```tsx
 * const SafeAsyncComponent = withAsyncErrorHandler(MyComponent)
 * ```
 */
export function withAsyncErrorHandler<P extends object>(
  Component: React.ComponentType<P & { onError?: (error: Error) => void }>
) {
  return function WithAsyncErrorHandlerComponent(props: P) {
    const handleAsyncError = useAsyncErrorHandler()

    return (
      <ErrorBoundary onError={(error) => handleAsyncError(error)}>
        <Component {...props} onError={handleAsyncError} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary


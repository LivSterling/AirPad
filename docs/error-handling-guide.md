# Error Handling Guide

This document explains error handling patterns in the AirPad MVP application.

## Overview

Error handling uses multiple layers:
1. **React Error Boundaries** - Catch rendering errors
2. **Async Error Handlers** - Catch promise rejections and async errors
3. **Try-Catch Blocks** - Catch specific operation errors
4. **Error Logging** - Track errors in development and production

## Error Boundary Component

The `ErrorBoundary` component catches React errors and displays a graceful fallback UI.

### Basic Usage

```tsx
import ErrorBoundary from '@/components/common/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  )
}
```

### Wrapping Page-Level Components

```tsx
// pages/index.tsx
import ErrorBoundary from '@/components/common/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary level="page">
      <PadGrid />
      <VoiceControls />
      <InstructionsOverlay />
    </ErrorBoundary>
  )
}
```

### Wrapping Section Components

```tsx
<ErrorBoundary level="section" fallback={<div>Grid Error</div>}>
  <PadGrid />
</ErrorBoundary>

<ErrorBoundary level="section">
  <VoiceControls />
</ErrorBoundary>
```

### Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={
    <div className="p-4 bg-red-100 rounded">
      <h3>Pad Grid Error</h3>
      <p>Failed to load the pad grid.</p>
    </div>
  }
>
  <PadGrid />
</ErrorBoundary>
```

### Error Handler Callback

```tsx
<ErrorBoundary
  level="section"
  onError={(error, errorInfo) => {
    // Send to logging service
    console.error('PadGrid error:', error)
    // Could send to Sentry, LogRocket, etc.
  }}
>
  <PadGrid />
</ErrorBoundary>
```

## Error Boundary Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Components to wrap |
| `fallback` | ReactNode | ErrorFallback | Custom error UI |
| `onError` | Function | undefined | Error callback |
| `level` | 'page' \| 'section' \| 'component' | 'component' | Error context |

### Level Differences

- **'page'**: Shows error without reset button, suggests page refresh
- **'section'**: Shows error with reset button for that section
- **'component'**: Shows compact error fallback

## Handling Async Errors

Error Boundaries only catch synchronous errors. For async errors, use `useAsyncErrorHandler()`:

```tsx
import { useAsyncErrorHandler } from '@/components/common/ErrorBoundary'

export function AudioInitializer() {
  const handleAsyncError = useAsyncErrorHandler()

  const initializeAudio = async () => {
    try {
      await audioEngine.initialize()
    } catch (error) {
      handleAsyncError(error as Error)
    }
  }

  return <button onClick={initializeAudio}>Initialize Audio</button>
}
```

Wrap the component with ErrorBoundary:

```tsx
<ErrorBoundary>
  <AudioInitializer />
</ErrorBoundary>
```

## Production Checklist

- [ ] ErrorBoundary at page level
- [ ] ErrorBoundary around major sections
- [ ] Async error handlers in useEffect
- [ ] Error logging configured
- [ ] Custom fallback UIs as needed
- [ ] Tested error scenarios
- [ ] User-friendly error messages
- [ ] No console errors on normal operation

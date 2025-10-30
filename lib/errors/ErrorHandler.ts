/**
 * Error Handling System
 * 
 * Centralized error handling with:
 * - Typed error codes
 * - Recovery strategies
 * - Error logging
 * - User-friendly messages
 */

import { AppError, IErrorHandler } from '@/types/integration'
import { ERROR_CODES } from '@/lib/constants'
import { EventBus, EventTypes } from '@/lib/events/EventBus'

/**
 * Error recovery strategies
 */
type RecoveryStrategy = 'retry' | 'fallback' | 'reload' | 'reset' | 'none'

interface ErrorConfig {
  code: string
  message: string
  userMessage: string
  recoverable: boolean
  strategy: RecoveryStrategy
  retryCount?: number
  fallbackAction?: () => Promise<void>
}

/**
 * Error configuration mapping
 */
const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  // Audio Errors
  [ERROR_CODES.AUDIO.INITIALIZATION_FAILED]: {
    code: ERROR_CODES.AUDIO.INITIALIZATION_FAILED,
    message: 'Failed to initialize audio context',
    userMessage: 'Audio system failed to start. Please refresh the page.',
    recoverable: true,
    strategy: 'reload',
  },
  [ERROR_CODES.AUDIO.SAMPLE_LOAD_FAILED]: {
    code: ERROR_CODES.AUDIO.SAMPLE_LOAD_FAILED,
    message: 'Failed to load audio samples',
    userMessage: 'Could not load sounds. Using fallback sounds.',
    recoverable: true,
    strategy: 'fallback',
  },
  [ERROR_CODES.AUDIO.PLAYBACK_FAILED]: {
    code: ERROR_CODES.AUDIO.PLAYBACK_FAILED,
    message: 'Audio playback failed',
    userMessage: 'Playback error occurred. Please try again.',
    recoverable: true,
    strategy: 'retry',
    retryCount: 3,
  },
  [ERROR_CODES.AUDIO.CONTEXT_SUSPENDED]: {
    code: ERROR_CODES.AUDIO.CONTEXT_SUSPENDED,
    message: 'Audio context suspended',
    userMessage: 'Audio paused. Tap to resume.',
    recoverable: true,
    strategy: 'retry',
  },

  // MediaPipe Errors
  [ERROR_CODES.MEDIAPIPE.INITIALIZATION_FAILED]: {
    code: ERROR_CODES.MEDIAPIPE.INITIALIZATION_FAILED,
    message: 'Failed to initialize hand tracking',
    userMessage: 'Hand tracking unavailable. Using fallback controls.',
    recoverable: true,
    strategy: 'fallback',
  },
  [ERROR_CODES.MEDIAPIPE.CAMERA_ACCESS_DENIED]: {
    code: ERROR_CODES.MEDIAPIPE.CAMERA_ACCESS_DENIED,
    message: 'Camera access denied',
    userMessage: 'Please allow camera access in your browser settings.',
    recoverable: false,
    strategy: 'none',
  },
  [ERROR_CODES.MEDIAPIPE.HAND_DETECTION_FAILED]: {
    code: ERROR_CODES.MEDIAPIPE.HAND_DETECTION_FAILED,
    message: 'Hand detection failed',
    userMessage: 'Hand tracking temporarily unavailable.',
    recoverable: true,
    strategy: 'retry',
    retryCount: 3,
  },

  // Voice Errors
  [ERROR_CODES.VOICE.INITIALIZATION_FAILED]: {
    code: ERROR_CODES.VOICE.INITIALIZATION_FAILED,
    message: 'Failed to initialize voice control',
    userMessage: 'Voice control unavailable. Using manual controls.',
    recoverable: true,
    strategy: 'fallback',
  },
  [ERROR_CODES.VOICE.MICROPHONE_ACCESS_DENIED]: {
    code: ERROR_CODES.VOICE.MICROPHONE_ACCESS_DENIED,
    message: 'Microphone access denied',
    userMessage: 'Please allow microphone access in your browser settings.',
    recoverable: false,
    strategy: 'none',
  },
  [ERROR_CODES.VOICE.RECOGNITION_FAILED]: {
    code: ERROR_CODES.VOICE.RECOGNITION_FAILED,
    message: 'Voice recognition failed',
    userMessage: 'Voice command not recognized. Try again.',
    recoverable: true,
    strategy: 'retry',
    retryCount: 2,
  },
  [ERROR_CODES.VOICE.NOT_SUPPORTED]: {
    code: ERROR_CODES.VOICE.NOT_SUPPORTED,
    message: 'Voice control not supported in this browser',
    userMessage: 'Voice commands not available. Please use manual controls.',
    recoverable: false,
    strategy: 'none',
  },

  // Recording Errors
  [ERROR_CODES.RECORDING.START_FAILED]: {
    code: ERROR_CODES.RECORDING.START_FAILED,
    message: 'Failed to start recording',
    userMessage: 'Could not start recording. Please try again.',
    recoverable: true,
    strategy: 'retry',
    retryCount: 2,
  },
  [ERROR_CODES.RECORDING.STOP_FAILED]: {
    code: ERROR_CODES.RECORDING.STOP_FAILED,
    message: 'Failed to stop recording',
    userMessage: 'Error stopping recording. Your loop may not be saved.',
    recoverable: true,
    strategy: 'retry',
    retryCount: 1,
  },
  [ERROR_CODES.RECORDING.PLAYBACK_FAILED]: {
    code: ERROR_CODES.RECORDING.PLAYBACK_FAILED,
    message: 'Failed to play recording',
    userMessage: 'Could not play loop. Please try again.',
    recoverable: true,
    strategy: 'retry',
    retryCount: 2,
  },
}

/**
 * Central error handler
 */
export class ErrorHandler implements IErrorHandler {
  private static instance: ErrorHandler
  private errorHistory: AppError[] = []
  private maxHistorySize = 50
  private recoveryInProgress = new Map<string, boolean>()

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle an error
   */
  public handle(error: AppError): void {
    // Add to history
    this.addToHistory(error)

    // Log error
    this.logError(error)

    // Emit error event
    EventBus.emit(EventTypes.APP_ERROR, error)

    // Emit system-specific error event
    EventBus.emit(`error:${error.system}`, error)

    // Attempt recovery if recoverable
    if (this.canRecover(error)) {
      this.recover(error)
        .catch((recoveryError) => {
          console.error('Recovery failed:', recoveryError)
        })
    } else {
      // Non-recoverable error - disable related features
      this.disableFeature(error.system)
    }
  }

  /**
   * Check if error is recoverable
   */
  public canRecover(error: AppError): boolean {
    return error.recoverable && !this.recoveryInProgress.get(error.code)
  }

  /**
   * Attempt to recover from error
   */
  public async recover(error: AppError): Promise<void> {
    if (this.recoveryInProgress.get(error.code)) {
      return // Already attempting recovery
    }

    this.recoveryInProgress.set(error.code, true)

    try {
      const config = ERROR_CONFIGS[error.code]
      if (!config) {
        throw new Error(`No recovery strategy for ${error.code}`)
      }

      switch (config.strategy) {
        case 'retry':
          await this.retryRecovery(error, config)
          break
        case 'fallback':
          await this.fallbackRecovery(error, config)
          break
        case 'reload':
          this.reloadRecovery()
          break
        case 'reset':
          await this.resetRecovery(error, config)
          break
        case 'none':
          // No recovery possible
          break
      }
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError)
      EventBus.emit('error:recovery', {
        originalError: error,
        recoveryError: recoveryError as Error,
      })
    } finally {
      this.recoveryInProgress.set(error.code, false)
    }
  }

  /**
   * Retry strategy
   */
  private async retryRecovery(error: AppError, config: ErrorConfig): Promise<void> {
    const maxRetries = config.retryCount || 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Retry attempt ${attempt}/${maxRetries} for ${error.code}`)

        // Wait with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise((resolve) => setTimeout(resolve, delay))

        // Attempt to reinitialize the failed system
        await this.reinitializeSystem(error.system)

        console.log(`Recovery successful on attempt ${attempt}`)
        return
      } catch (err) {
        lastError = err as Error
        console.error(`Retry attempt ${attempt} failed:`, err)
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  /**
   * Fallback strategy
   */
  private async fallbackRecovery(error: AppError, config: ErrorConfig): Promise<void> {
    console.log(`Activating fallback for ${error.system}`)

    // Disable the failed system
    this.disableFeature(error.system)

    // Execute fallback action if provided
    if (config.fallbackAction) {
      await config.fallbackAction()
    }

    // Notify UI to show fallback controls
    EventBus.emit(`fallback:${error.system}`)
  }

  /**
   * Reload strategy
   */
  private reloadRecovery(): void {
    console.log('Reloading application')
    // Delay reload to allow UI to update
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  /**
   * Reset strategy
   */
  private async resetRecovery(error: AppError, config: ErrorConfig): Promise<void> {
    console.log(`Resetting ${error.system}`)
    
    // Clear any cached state for this system
    this.clearSystemCache(error.system)

    // Attempt to reinitialize
    await this.reinitializeSystem(error.system)
  }

  /**
   * Reinitialize a failed system
   */
  private async reinitializeSystem(system: string): Promise<void> {
    switch (system) {
      case 'audio':
        // Audio engine reinitialization
        EventBus.emit('system:reinitialize', { system: 'audio' })
        break
      case 'gesture':
        // Hand tracker reinitialization
        EventBus.emit('system:reinitialize', { system: 'gesture' })
        break
      case 'voice':
        // Voice controller reinitialization
        EventBus.emit('system:reinitialize', { system: 'voice' })
        break
      case 'tracking':
        // Tracking reinitialization
        EventBus.emit('system:reinitialize', { system: 'tracking' })
        break
      default:
        throw new Error(`Unknown system: ${system}`)
    }

    // Wait for reinitialization
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  /**
   * Disable a feature/system
   */
  private disableFeature(system: string): void {
    console.log(`Disabling feature: ${system}`)
    EventBus.emit(`feature:disabled`, { system })
  }

  /**
   * Clear system cache
   */
  private clearSystemCache(system: string): void {
    try {
      const cacheKey = `${system}:cache`
      sessionStorage.removeItem(cacheKey)
    } catch (err) {
      console.error('Failed to clear cache:', err)
    }
  }

  /**
   * Log error with context
   */
  private logError(error: AppError): void {
    const logLevel = error.recoverable ? 'warn' : 'error'
    const logMessage = `[${error.system.toUpperCase()}] ${error.code}: ${error.message}`

    console.group(logMessage)
    console.log('Message:', error.message)
    console.log('System:', error.system)
    console.log('Recoverable:', error.recoverable)
    if (error.suggestion) {
      console.log('Suggestion:', error.suggestion)
    }
    if (error.context) {
      console.log('Context:', error.context)
    }
    if (error.originalError) {
      console.error('Original Error:', error.originalError)
    }
    console.groupEnd()

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(error)
    }
  }

  /**
   * Send error to logging service (future)
   */
  private sendToLoggingService(error: AppError): void {
    // TODO: Implement logging service integration (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error.originalError, {
    //   tags: { system: error.system },
    //   extra: error.context
    // })
  }

  /**
   * Add error to history
   */
  private addToHistory(error: AppError): void {
    this.errorHistory.push(error)

    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }
  }

  /**
   * Get error history
   */
  public getHistory(): AppError[] {
    return [...this.errorHistory]
  }

  /**
   * Get recent errors by system
   */
  public getErrorsBySystem(system: string, limit: number = 10): AppError[] {
    return this.errorHistory
      .filter((err) => err.system === system)
      .slice(-limit)
  }

  /**
   * Get most recent error
   */
  public getLatestError(): AppError | null {
    return this.errorHistory[this.errorHistory.length - 1] || null
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errorHistory = []
  }
}

/**
 * Helper function to create typed errors
 */
export function createAppError(
  code: string,
  system: 'audio' | 'gesture' | 'voice' | 'tracking' | 'store' | 'ui',
  originalError?: Error,
  context?: Record<string, any>
): AppError {
  const config = ERROR_CONFIGS[code]

  return {
    code,
    message: config?.message || 'Unknown error',
    system,
    timestamp: Date.now(),
    originalError,
    context,
    recoverable: config?.recoverable ?? false,
    suggestion: config?.userMessage,
  }
}

/**
 * Hook for React components
 */
export function useErrorHandler(): ErrorHandler {
  return ErrorHandler.getInstance()
}

export default ErrorHandler


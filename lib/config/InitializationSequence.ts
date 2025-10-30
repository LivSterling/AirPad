/**
 * Initialization Sequence Manager
 * 
 * Manages the boot sequence for all systems in the correct order:
 * 1. EventBus (communication layer)
 * 2. Error Handler (error management)
 * 3. AudioEngine (audio context + sample loading)
 * 4. HandTracker (camera + MediaPipe)
 * 5. VoiceController (microphone + speech API)
 * 6. Store (state management)
 * 7. Connectors (integration layer)
 * 8. UI (components + handlers)
 * 
 * Each system can have dependencies that must be initialized first.
 */

import { EventBus, EventTypes } from '@/lib/events/EventBus'
import { AudioEngine } from '@/lib/audio/AudioEngine'
import { HandTracker } from '@/lib/tracking/HandTracker'
import { VoiceController } from '@/lib/voice/VoiceController'
import { ErrorHandler, createAppError } from '@/lib/errors/ErrorHandler'
import { AudioStoreConnector } from '@/lib/integration/AudioStoreConnector'
import { ERROR_CODES, FEATURES } from '@/lib/constants'
import type { AppError, IInitializable } from '@/types/integration'

/**
 * System initialization phases
 */
enum InitPhase {
  FOUNDATION = 'foundation', // EventBus, ErrorHandler
  CORE = 'core', // AudioEngine, HandTracker, VoiceController
  STATE = 'state', // Store
  INTEGRATION = 'integration', // Connectors
  UI = 'ui', // Components
}

/**
 * System definition with dependencies and phase
 */
interface SystemConfig {
  name: string
  phase: InitPhase
  initializer: () => Promise<void>
  dependencies: string[]
  optional: boolean
  timeout: number // milliseconds
}

/**
 * Initialization sequencer
 */
export class InitializationSequence {
  private static instance: InitializationSequence
  private systems: Map<string, SystemConfig> = new Map()
  private initializationOrder: string[] = []
  private initializationState: Map<string, 'pending' | 'initializing' | 'complete' | 'failed'> =
    new Map()
  private completedSystems: Set<string> = new Set()
  private failedSystems: Set<string> = new Set()
  private errorHandler: ErrorHandler

  private constructor() {
    this.errorHandler = ErrorHandler.getInstance()
    this.registerSystems()
    this.computeInitializationOrder()
  }

  public static getInstance(): InitializationSequence {
    if (!InitializationSequence.instance) {
      InitializationSequence.instance = new InitializationSequence()
    }
    return InitializationSequence.instance
  }

  /**
   * Register all systems and their dependencies
   */
  private registerSystems(): void {
    // Phase 1: Foundation
    this.registerSystem({
      name: 'EventBus',
      phase: InitPhase.FOUNDATION,
      initializer: async () => {
        // EventBus is static - no async init needed
        console.log('EventBus ready')
        EventBus.emit(EventTypes.APP_INITIALIZED, {})
      },
      dependencies: [],
      optional: false,
      timeout: 1000,
    })

    this.registerSystem({
      name: 'ErrorHandler',
      phase: InitPhase.FOUNDATION,
      initializer: async () => {
        // ErrorHandler is static - no async init needed
        console.log('ErrorHandler ready')
      },
      dependencies: ['EventBus'],
      optional: false,
      timeout: 1000,
    })

    // Phase 2: Core Systems
    this.registerSystem({
      name: 'AudioEngine',
      phase: InitPhase.CORE,
      initializer: async () => {
        if (!FEATURES.HAND_TRACKING) {
          console.log('AudioEngine disabled via feature flag')
          return
        }
        const audioEngine = AudioEngine.getInstance()
        await audioEngine.initialize()
        EventBus.emit(EventTypes.AUDIO_INITIALIZED, {})
      },
      dependencies: ['EventBus', 'ErrorHandler'],
      optional: false,
      timeout: 5000,
    })

    this.registerSystem({
      name: 'HandTracker',
      phase: InitPhase.CORE,
      initializer: async () => {
        if (!FEATURES.HAND_TRACKING) {
          console.log('HandTracker disabled via feature flag')
          return
        }
        const handTracker = HandTracker.getInstance()
        await handTracker.initialize()
        EventBus.emit(EventTypes.TRACKING_INITIALIZED, {})
      },
      dependencies: ['EventBus', 'ErrorHandler'],
      optional: true, // Can fall back to UI controls
      timeout: 10000,
    })

    this.registerSystem({
      name: 'VoiceController',
      phase: InitPhase.CORE,
      initializer: async () => {
        if (!FEATURES.VOICE_CONTROL) {
          console.log('VoiceController disabled via feature flag')
          return
        }
        const voiceController = VoiceController.getInstance()
        await voiceController.initialize()
        EventBus.emit(EventTypes.VOICE_INITIALIZED, {})
      },
      dependencies: ['EventBus', 'ErrorHandler'],
      optional: true, // Can fall back to UI controls
      timeout: 5000,
    })

    // Phase 3: State Management
    this.registerSystem({
      name: 'Store',
      phase: InitPhase.STATE,
      initializer: async () => {
        // Store (Zustand) is initialized on first use
        console.log('Store ready')
      },
      dependencies: ['EventBus', 'ErrorHandler'],
      optional: false,
      timeout: 2000,
    })

    // Phase 4: Integration
    this.registerSystem({
      name: 'AudioStoreConnector',
      phase: InitPhase.INTEGRATION,
      initializer: async () => {
        const connector = AudioStoreConnector.getInstance()
        await connector.initialize()
        console.log('AudioStoreConnector ready')
      },
      dependencies: ['AudioEngine', 'Store', 'HandTracker', 'VoiceController'],
      optional: false,
      timeout: 5000,
    })

    // Phase 5: UI
    this.registerSystem({
      name: 'UI',
      phase: InitPhase.UI,
      initializer: async () => {
        // UI initializes automatically after all systems ready
        EventBus.emit('ui:systemsReady')
        console.log('UI ready')
      },
      dependencies: ['AudioStoreConnector', 'Store'],
      optional: false,
      timeout: 2000,
    })
  }

  /**
   * Register a system
   */
  private registerSystem(config: SystemConfig): void {
    this.systems.set(config.name, config)
    this.initializationState.set(config.name, 'pending')
  }

  /**
   * Compute initialization order based on dependencies
   * Uses topological sort to handle DAG
   */
  private computeInitializationOrder(): void {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (system: string) => {
      if (visited.has(system)) return
      if (visiting.has(system)) {
        throw new Error(`Circular dependency detected involving ${system}`)
      }

      visiting.add(system)
      const config = this.systems.get(system)

      if (config) {
        for (const dep of config.dependencies) {
          visit(dep)
        }
      }

      visiting.delete(system)
      visited.add(system)
      order.push(system)
    }

    // Visit all systems
    for (const system of this.systems.keys()) {
      visit(system)
    }

    this.initializationOrder = order
    console.log('Initialization order:', order)
  }

  /**
   * Execute full initialization sequence
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Starting system initialization...')
    EventBus.emit('app:initializationStarted')

    const startTime = performance.now()
    const results: { system: string; status: 'success' | 'failed'; time: number }[] = []

    for (const systemName of this.initializationOrder) {
      const config = this.systems.get(systemName)
      if (!config) continue

      const systemStartTime = performance.now()
      this.initializationState.set(systemName, 'initializing')

      try {
        console.log(`⏳ Initializing ${systemName}...`)

        // Execute with timeout
        await this.executeWithTimeout(config.initializer, config.timeout)

        const systemTime = performance.now() - systemStartTime
        this.completedSystems.add(systemName)
        this.initializationState.set(systemName, 'complete')
        results.push({ system: systemName, status: 'success', time: systemTime })

        console.log(`✅ ${systemName} initialized (${systemTime.toFixed(0)}ms)`)
      } catch (error) {
        const systemTime = performance.now() - systemStartTime
        this.failedSystems.add(systemName)
        this.initializationState.set(systemName, 'failed')
        results.push({ system: systemName, status: 'failed', time: systemTime })

        const appError = createAppError(
          'INITIALIZATION_FAILED',
          'audio',
          error as Error,
          { system: systemName }
        )

        if (config.optional) {
          console.warn(`⚠️ ${systemName} failed to initialize (optional) - ${error}`)
          EventBus.emit(`${systemName}:initializationFailed`, { error, optional: true })
        } else {
          console.error(`❌ ${systemName} failed to initialize - ${error}`)
          this.errorHandler.handle(appError)
          throw new Error(`Failed to initialize ${systemName}: ${error}`)
        }
      }
    }

    const totalTime = performance.now() - startTime
    console.log(`\n🎉 System initialization complete in ${totalTime.toFixed(0)}ms`)
    console.table(results)

    EventBus.emit('app:initializationComplete', {
      totalTime,
      systems: results,
    })
  }

  /**
   * Execute function with timeout
   */
  private executeWithTimeout(fn: () => Promise<void>, timeout: number): Promise<void> {
    return Promise.race([
      fn(),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
      ),
    ])
  }

  /**
   * Get initialization state
   */
  public getState(): {
    completed: string[]
    failed: string[]
    pending: string[]
    isComplete: boolean
  } {
    const pending = this.initializationOrder.filter(
      (s) => !this.completedSystems.has(s) && !this.failedSystems.has(s)
    )

    return {
      completed: Array.from(this.completedSystems),
      failed: Array.from(this.failedSystems),
      pending,
      isComplete: pending.length === 0 && this.failedSystems.size === 0,
    }
  }

  /**
   * Check if specific system is initialized
   */
  public isInitialized(systemName: string): boolean {
    return this.completedSystems.has(systemName)
  }

  /**
   * Check if system initialization failed
   */
  public hasFailed(systemName: string): boolean {
    return this.failedSystems.has(systemName)
  }

  /**
   * Retry failed optional systems
   */
  public async retryFailed(): Promise<void> {
    const failed = Array.from(this.failedSystems)

    for (const systemName of failed) {
      const config = this.systems.get(systemName)
      if (!config || !config.optional) continue

      console.log(`🔄 Retrying ${systemName}...`)
      try {
        await this.executeWithTimeout(config.initializer, config.timeout)
        this.failedSystems.delete(systemName)
        this.completedSystems.add(systemName)
        console.log(`✅ ${systemName} initialized on retry`)
      } catch (error) {
        console.warn(`⚠️ ${systemName} still failing`, error)
      }
    }
  }

  /**
   * Cleanup all systems (for shutdown)
   */
  public async dispose(): Promise<void> {
    console.log('🛑 Shutting down systems...')
    
    // Reverse order for cleanup
    const reverseOrder = [...this.initializationOrder].reverse()

    for (const systemName of reverseOrder) {
      if (systemName === 'AudioEngine') {
        AudioEngine.getInstance().dispose()
      } else if (systemName === 'HandTracker') {
        HandTracker.getInstance().stop()
      } else if (systemName === 'VoiceController') {
        VoiceController.getInstance().stop()
      }
    }

    this.completedSystems.clear()
    this.failedSystems.clear()
    EventBus.off() // Clear all event listeners
    console.log('✅ Shutdown complete')
  }
}

/**
 * Hook for React components
 */
export function useInitializationSequence(): InitializationSequence {
  return InitializationSequence.getInstance()
}

export default InitializationSequence

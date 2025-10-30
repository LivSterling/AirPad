/**
 * Integration Types
 * 
 * Defines the interfaces and contracts for how different systems communicate.
 * This ensures type-safe integration between:
 * - HandTracker → AudioEngine
 * - VoiceController → Store
 * - AudioEngine ↔ Store
 * - All systems ↔ EventBus
 */

import { KitType, PadIndex, RecordedEvent, LoopData } from './audio'

// =============================================================================
// HAND GESTURE INTEGRATION
// =============================================================================

/**
 * Gesture detection result from HandTracker
 */
export interface GestureEvent {
  type: 'pinch' | 'hover' | 'none'
  padIndex: number | null
  confidence: number
  timestamp: number
  velocity?: number // For future pressure sensitivity
}

/**
 * Gesture handler interface for receiving gesture events
 */
export interface IGestureHandler {
  onPinch(padIndex: number, velocity: number): void
  onHover(padIndex: number | null): void
  onError(error: Error): void
}

/**
 * Audio trigger request from gesture
 */
export interface AudioTriggerRequest {
  padIndex: PadIndex
  kitType: KitType
  velocity: number
  timestamp: number
  source: 'gesture' | 'voice' | 'ui'
}

// =============================================================================
// VOICE COMMAND INTEGRATION
// =============================================================================

/**
 * Voice command recognized by VoiceController
 */
export interface VoiceCommand {
  intent: string // 'record', 'stop', 'kit:drums', etc.
  confidence: number
  rawTranscript: string
  timestamp: number
  language: string
}

/**
 * Voice command handler interface
 */
export interface IVoiceCommandHandler {
  onCommand(command: VoiceCommand): void
  onListeningStart(): void
  onListeningStop(): void
  onError(error: Error): void
}

/**
 * Voice command request to execute
 */
export interface VoiceCommandRequest {
  intent: string
  parameters?: Record<string, any>
  timestamp: number
}

// =============================================================================
// AUDIO ENGINE INTEGRATION
// =============================================================================

/**
 * Audio engine state that's exposed to the system
 */
export interface AudioEngineState {
  isInitialized: boolean
  isPlaying: boolean
  isRecording: boolean
  currentKit: KitType
  masterVolume: number
  bpm: number
  transportTime: string
  activeLoopsCount: number
}

/**
 * Audio engine listener for state changes
 */
export interface IAudioEngineListener {
  onStateChange(state: AudioEngineState): void
  onPadTriggered(padIndex: PadIndex, kitType: KitType): void
  onRecordingStarted(): void
  onRecordingStopped(loopData: LoopData | null): void
  onKitSwitched(kitType: KitType): void
  onError(error: Error, errorCode: string): void
}

/**
 * Audio engine action request
 */
export interface AudioEngineAction {
  type:
    | 'triggerPad'
    | 'startRecording'
    | 'stopRecording'
    | 'startPlayback'
    | 'stopPlayback'
    | 'switchKit'
    | 'setVolume'
    | 'setBPM'
  payload: Record<string, any>
  timestamp: number
}

// =============================================================================
// STATE STORE INTEGRATION
// =============================================================================

/**
 * Store actions that can be dispatched
 */
export type StoreAction =
  | { type: 'SET_CURRENT_KIT'; payload: KitType }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_MASTER_VOLUME'; payload: number }
  | { type: 'SET_BPM'; payload: number }
  | { type: 'ADD_RECORDED_EVENT'; payload: RecordedEvent }
  | { type: 'CLEAR_CURRENT_LOOP' }
  | { type: 'SAVE_CURRENT_LOOP' }
  | { type: 'REMOVE_SAVED_LOOP'; payload: string }
  | { type: 'TOGGLE_ACTIVE_LOOP'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'performance' | 'mixer' | 'settings' }
  | { type: 'TOGGLE_HELP' }

/**
 * Store state listener
 */
export interface IStoreListener {
  onKitChanged(kitType: KitType): void
  onRecordingStateChanged(isRecording: boolean): void
  onPlayingStateChanged(isPlaying: boolean): void
  onVolumeChanged(volume: number): void
  onBPMChanged(bpm: number): void
  onLoopSaved(loopData: LoopData): void
  onError(error: Error): void
}

/**
 * Store state snapshot
 */
export interface StoreSnapshot {
  currentKit: KitType
  isRecording: boolean
  isPlaying: boolean
  masterVolume: number
  bpm: number
  currentLoop: RecordedEvent[]
  savedLoops: LoopData[]
  activeLoops: string[]
  activeView: 'performance' | 'mixer' | 'settings'
  showHelp: boolean
}

// =============================================================================
// ERROR HANDLING INTEGRATION
// =============================================================================

/**
 * Structured error that can be propagated through systems
 */
export interface AppError {
  code: string
  message: string
  system: 'audio' | 'gesture' | 'voice' | 'tracking' | 'store' | 'ui'
  timestamp: number
  originalError?: Error
  context?: Record<string, any>
  recoverable: boolean
  suggestion?: string
}

/**
 * Error handler interface
 */
export interface IErrorHandler {
  handle(error: AppError): void
  canRecover(error: AppError): boolean
  recover(error: AppError): Promise<void>
}

// =============================================================================
// SYSTEM LIFECYCLE INTEGRATION
// =============================================================================

/**
 * Initializable system interface
 */
export interface IInitializable {
  initialize(): Promise<void>
  isInitialized(): boolean
  dispose(): void
}

/**
 * System initialization order and dependencies
 */
export interface InitializationConfig {
  systems: IInitializable[]
  order: (keyof typeof SystemOrder)[]
  timeout: number
  retryCount: number
}

export enum SystemOrder {
  AUDIO_ENGINE = 0,
  HAND_TRACKER = 1,
  VOICE_CONTROLLER = 2,
  EVENT_BUS = 3,
  STORE = 4,
  CONNECTORS = 5,
  UI = 6,
}

// =============================================================================
// PERFORMANCE MONITORING INTEGRATION
// =============================================================================

/**
 * Performance metric sample
 */
export interface PerformanceMetric {
  timestamp: number
  fps: number
  audioLatencyMs: number
  gestureLatencyMs: number
  memoryUsageMb: number
  activeLoopsCount: number
  recordingActive: boolean
}

/**
 * Performance monitor interface
 */
export interface IPerformanceMonitor {
  startMonitoring(): void
  stopMonitoring(): void
  getMetrics(): PerformanceMetric[]
  getAverageMetrics(lastNSamples: number): PerformanceMetric
  onThresholdExceeded?(metric: PerformanceMetric, threshold: string): void
}

// =============================================================================
// FEATURE INTEGRATION
// =============================================================================

/**
 * Feature flag interface
 */
export interface IFeatureFlagProvider {
  isEnabled(feature: string): boolean
  getFeatures(): Record<string, boolean>
  setFeature(feature: string, enabled: boolean): void
}

/**
 * Conditional feature handler
 */
export interface IConditionalFeature {
  canEnable(): boolean
  enable(): Promise<void>
  disable(): Promise<void>
  onEnableError(error: Error): void
}

// =============================================================================
// EVENT INTEGRATION
// =============================================================================

/**
 * Event payload for different event types
 */
export interface EventPayload {
  'audio:initialized': { audioContext: AudioContext }
  'audio:kitChanged': { kitType: KitType }
  'audio:volumeChanged': { volume: number }
  'audio:bpmChanged': { bpm: number }
  'gesture:padTriggered': { padIndex: number; velocity: number }
  'gesture:pinchDetected': { padIndex: number }
  'gesture:hoverChanged': { padIndex: number | null }
  'recording:started': {}
  'recording:stopped': { loopData: LoopData | null }
  'playback:started': {}
  'playback:stopped': {}
  'voice:commandReceived': VoiceCommand
  'tracking:handDetected': { landmarkCount: number }
  'tracking:handLost': {}
  'error:audio': AppError
  'error:gesture': AppError
  'error:voice': AppError
  [key: string]: any
}

/**
 * Typed event listener
 */
export type TypedEventListener<K extends keyof EventPayload> = (
  payload: EventPayload[K]
) => void

// =============================================================================
// INTEGRATION MIDDLEWARE
// =============================================================================

/**
 * Middleware for intercepting and transforming events
 */
export interface IIntegrationMiddleware {
  beforeAudioTrigger?(request: AudioTriggerRequest): AudioTriggerRequest | null
  afterAudioTrigger?(request: AudioTriggerRequest, result: any): void
  beforeStoreUpdate?(action: StoreAction): StoreAction | null
  afterStoreUpdate?(action: StoreAction, newState: StoreSnapshot): void
  onError?(error: AppError): AppError | null
}

// =============================================================================
// SYSTEM COMMUNICATION PATTERNS
// =============================================================================

/**
 * Communication flow types
 */
export interface CommunicationFlow {
  source: 'gesture' | 'voice' | 'ui' | 'audio' | 'timer'
  target: 'audio' | 'store' | 'event-bus'
  action: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  async: boolean
}

/**
 * Command executor for async operations
 */
export interface ICommandExecutor {
  execute(command: AudioEngineAction | VoiceCommandRequest): Promise<void>
  cancel(commandId: string): void
  getStatus(commandId: string): 'pending' | 'executing' | 'completed' | 'failed'
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Helper functions to check types at runtime
 */
export const IntegrationTypeGuards = {
  isGestureEvent(value: any): value is GestureEvent {
    return (
      value &&
      typeof value === 'object' &&
      ['pinch', 'hover', 'none'].includes(value.type) &&
      typeof value.padIndex === 'number'
    )
  },

  isVoiceCommand(value: any): value is VoiceCommand {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.intent === 'string' &&
      typeof value.confidence === 'number'
    )
  },

  isAudioTriggerRequest(value: any): value is AudioTriggerRequest {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.padIndex === 'number' &&
      typeof value.velocity === 'number'
    )
  },

  isAppError(value: any): value is AppError {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.code === 'string' &&
      typeof value.message === 'string' &&
      typeof value.system === 'string'
    )
  },
}

export default {
  IntegrationTypeGuards,
  SystemOrder,
}


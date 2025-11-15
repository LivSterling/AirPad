// Core type definitions for AirPad MVP

// Audio Engine Types
export type KitType = 'drums' | 'piano' | 'funk'
export type PadIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface RecordedEvent {
  padIndex: PadIndex
  timestamp: number
  kitType: KitType
  velocity?: number
}

export interface LoopData {
  id: string
  events: RecordedEvent[]
  duration: number
  bpm?: number
  createdAt: Date
  name?: string
}

export interface KitConfig {
  name: string
  type: KitType
  samples: string[]
  metadata: {
    bpm?: number
    key?: string
    genre?: string
  }
}

// Application State Types
export interface AppState {
  // Audio state
  currentKit: KitType
  isRecording: boolean
  isPlaying: boolean
  masterVolume: number
  bpm: number
  
  // Loop management
  currentLoop: RecordedEvent[]
  savedLoops: LoopData[]
  activeLoops: string[]
  
  // UI state
  activeView: 'performance' | 'loops' | 'settings'
  showHelp: boolean
  
  // Control state
  gestureControlEnabled: boolean
  voiceControlEnabled: boolean
  airInstrumentMode: boolean
}

// Gesture Detection Types
export interface HandLandmark {
  x: number
  y: number
  z: number
}

export interface GestureData {
  landmarks: HandLandmark[]
  handedness: 'Left' | 'Right'
  confidence: number
}

export interface TriggerZone {
  id: string
  x: number
  y: number
  width: number
  height: number
  padIndex: PadIndex
  isActive: boolean
}

// Voice Command Types
export interface VoiceCommand {
  phrase: string
  action: string
  parameters?: Record<string, any>
}

// Component Interface Types
export interface PadComponentProps {
  index: PadIndex
  isActive: boolean
  onTrigger: (index: PadIndex, velocity?: number) => void
  label?: string
  className?: string
}

export interface KitSelectorProps {
  currentKit: KitType
  onKitChange: (kit: KitType) => void
  availableKits: KitConfig[]
}

export interface LoopManagerProps {
  loops: LoopData[]
  activeLoops: string[]
  onPlayLoop: (loopId: string) => void
  onStopLoop: (loopId: string) => void
  onDeleteLoop: (loopId: string) => void
  onSaveLoop: () => void
}

// Audio Engine Interface
export interface IAudioEngine {
  initialize(): Promise<void>
  triggerPad(padIndex: PadIndex, kitType?: KitType, velocity?: number): void
  switchKit(kitType: KitType): Promise<void>
  startRecording(): void
  stopRecording(): LoopData | null
  playLoop(loopId: string, events: RecordedEvent[]): void
  stopLoop(loopId: string): void
  stopAllLoops(): void
  setMasterLoopLength(lengthMs: number): void
  getMasterLoopLength(): number
  getRecordedEvents(): RecordedEvent[]
  setMasterVolume(volume: number): void
  setBPM(bpm: number): void
  dispose(): void
}

// State Management Interface
export interface AppStore extends AppState {
  // Audio actions
  setCurrentKit: (kit: KitType) => void
  setRecording: (recording: boolean) => void
  setPlaying: (playing: boolean) => void
  setMasterVolume: (volume: number) => void
  setBPM: (bpm: number) => void
  
  // Loop actions
  addRecordedEvent: (event: RecordedEvent) => void
  saveCurrentLoop: () => void
  clearCurrentLoop: () => void
  addSavedLoop: (loop: LoopData) => void
  removeSavedLoop: (loopId: string) => void
  clearAllLoops: () => void
  toggleActiveLoop: (loopId: string) => void
  
  // UI actions
  setActiveView: (view: AppState['activeView']) => void
  toggleHelp: () => void
  
  // Control actions
  setGestureControl: (enabled: boolean) => void
  setVoiceControl: (enabled: boolean) => void
  setAirInstrumentMode: (enabled: boolean) => void
}

// Error Types
export interface AudioEngineError extends Error {
  code: 'INITIALIZATION_FAILED' | 'SAMPLE_LOAD_FAILED' | 'PLAYBACK_FAILED'
  details?: any
}

export interface GestureTrackingError extends Error {
  code: 'CAMERA_ACCESS_DENIED' | 'MEDIAPIPE_INIT_FAILED' | 'TRACKING_FAILED'
  details?: any
}

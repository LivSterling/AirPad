// Audio-specific type definitions for AirPad MVP

// Audio Engine Types
export type KitType = 'drums' | 'piano' | 'synth'
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

// Audio Engine Interface
export interface IAudioEngine {
  initialize(): Promise<void>
  triggerPad(padIndex: PadIndex, kitType?: KitType, velocity?: number): void
  switchKit(kitType: KitType): Promise<void>
  startRecording(): void
  stopRecording(): LoopData | null
  playLoop(loopId: string, events: RecordedEvent[]): void
  stopLoop(loopId: string): void
  setMasterVolume(volume: number): void
  setBPM(bpm: number): void
  dispose(): void
}

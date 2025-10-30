/**
 * AudioStoreConnector
 * 
 * Bridges the AudioEngine and Zustand state store, creating a two-way data flow:
 * - AudioEngine → Store: Current audio state (playing, recording, etc.)
 * - Store → AudioEngine: User commands (play, record, change kit, etc.)
 * 
 * This connector prevents tight coupling while ensuring synchronization.
 */

import { AudioEngine } from '@/lib/audio/AudioEngine'
import { useAppStore } from '@/lib/store'
import { EventBus } from '@/lib/events/EventBus'
import { ERROR_CODES } from '@/lib/constants'

type UnsubscribeCallback = () => void

/**
 * AudioStoreConnector manages the relationship between AudioEngine and Zustand
 */
export class AudioStoreConnector {
  private static instance: AudioStoreConnector
  private audioEngine: AudioEngine
  private unsubscribers: UnsubscribeCallback[] = []
  private initialized = false

  private constructor() {
    this.audioEngine = AudioEngine.getInstance()
  }

  public static getInstance(): AudioStoreConnector {
    if (!AudioStoreConnector.instance) {
      AudioStoreConnector.instance = new AudioStoreConnector()
    }
    return AudioStoreConnector.instance
  }

  /**
   * Initialize the connector - set up listeners and sync initial state
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Initialize AudioEngine first
      await this.audioEngine.initialize()

      // Set up store → audio listeners
      this.setupStoreListeners()

      // Set up audio → store listeners
      this.setupAudioListeners()

      this.initialized = true
      console.log('AudioStoreConnector initialized')
    } catch (error) {
      console.error('Failed to initialize AudioStoreConnector:', error)
      throw error
    }
  }

  /**
   * Set up listeners for store changes → update audio engine
   */
  private setupStoreListeners(): void {
    const store = useAppStore

    // Listen to current kit changes
    const unsubscribeKit = store.subscribe(
      (state) => state.currentKit,
      (currentKit) => {
        this.handleKitChange(currentKit)
      }
    )
    this.unsubscribers.push(unsubscribeKit)

    // Listen to master volume changes
    const unsubscribeVolume = store.subscribe(
      (state) => state.masterVolume,
      (volume) => {
        this.audioEngine.setMasterVolume(volume)
        EventBus.emit('audio:volumeChanged', { volume })
      }
    )
    this.unsubscribers.push(unsubscribeVolume)

    // Listen to BPM changes
    const unsubscribeBPM = store.subscribe(
      (state) => state.bpm,
      (bpm) => {
        this.audioEngine.setBPM(bpm)
        EventBus.emit('audio:bpmChanged', { bpm })
      }
    )
    this.unsubscribers.push(unsubscribeBPM)

    // Listen to recording state changes
    const unsubscribeRecording = store.subscribe(
      (state) => state.isRecording,
      (isRecording) => {
        if (isRecording) {
          this.audioEngine.startRecording()
          EventBus.emit('recording:started')
        } else {
          const loopData = this.audioEngine.stopRecording()
          EventBus.emit('recording:stopped', { loopData })
        }
      }
    )
    this.unsubscribers.push(unsubscribeRecording)

    // Listen to playing state changes
    const unsubscribePlaying = store.subscribe(
      (state) => state.isPlaying,
      (isPlaying) => {
        if (isPlaying) {
          // Start playing active loops
          const state = store.getState()
          state.activeLoops.forEach((loopId) => {
            const loop = state.savedLoops.find((l) => l.id === loopId)
            if (loop) {
              this.audioEngine.playLoop(loopId, loop.events)
            }
          })
          EventBus.emit('playback:started')
        } else {
          this.audioEngine.stopAllLoops()
          EventBus.emit('playback:stopped')
        }
      }
    )
    this.unsubscribers.push(unsubscribePlaying)
  }

  /**
   * Set up listeners for audio events → update store
   */
  private setupAudioListeners(): void {
    const store = useAppStore

    // Listen to pad triggers (from hand tracking)
    EventBus.on('gesture:padTriggered', ({ padIndex, velocity }: { padIndex: number; velocity: number }) => {
      const state = store.getState()
      this.audioEngine.triggerPad(padIndex, state.currentKit, velocity)

      // If recording, capture the event
      if (state.isRecording) {
        store.getState().addRecordedEvent({
          padIndex: padIndex as any,
          timestamp: Date.now(),
          kitType: state.currentKit,
          velocity,
        })
      }
    })

    // Listen to loop stack changes
    EventBus.on('loops:stateChanged', ({ loops }: { loops: string[] }) => {
      store.getState().toggleActiveLoop // triggered by user interaction
    })
  }

  /**
   * Handle kit change with error recovery
   */
  private async handleKitChange(kitType: string): Promise<void> {
    try {
      await this.audioEngine.switchKit(kitType as any)
      EventBus.emit('audio:kitChanged', { kitType })
    } catch (error) {
      console.error(`Failed to switch to kit ${kitType}:`, error)
      EventBus.emit('error:audioKitSwitch', {
        error: ERROR_CODES.AUDIO.SAMPLE_LOAD_FAILED,
        kitType,
      })
      // Revert kit change in store
      useAppStore.getState().setCurrentKit(useAppStore.getState().currentKit)
    }
  }

  /**
   * Public API for UI to trigger pads
   */
  public triggerPad(padIndex: number, velocity: number = 1): void {
    const state = useAppStore.getState()
    this.audioEngine.triggerPad(padIndex, state.currentKit, velocity)

    if (state.isRecording) {
      state.addRecordedEvent({
        padIndex: padIndex as any,
        timestamp: Date.now(),
        kitType: state.currentKit,
        velocity,
      })
    }
  }

  /**
   * Public API for UI to start recording
   */
  public startRecording(): void {
    useAppStore.getState().setRecording(true)
  }

  /**
   * Public API for UI to stop recording
   */
  public stopRecording(): void {
    useAppStore.getState().setRecording(false)
  }

  /**
   * Public API for UI to start playback
   */
  public startPlayback(): void {
    useAppStore.getState().setPlaying(true)
  }

  /**
   * Public API for UI to stop playback
   */
  public stopPlayback(): void {
    useAppStore.getState().setPlaying(false)
  }

  /**
   * Public API for UI to change kit
   */
  public setKit(kitType: string): void {
    useAppStore.getState().setCurrentKit(kitType as any)
  }

  /**
   * Public API for UI to change volume
   */
  public setVolume(volume: number): void {
    useAppStore.getState().setMasterVolume(volume)
  }

  /**
   * Public API for UI to change BPM
   */
  public setBPM(bpm: number): void {
    useAppStore.getState().setBPM(bpm)
  }

  /**
   * Public API to save current loop
   */
  public saveCurrentLoop(): void {
    useAppStore.getState().saveCurrentLoop()
  }

  /**
   * Public API to clear current loop
   */
  public clearCurrentLoop(): void {
    useAppStore.getState().clearCurrentLoop()
  }

  /**
   * Cleanup: remove all listeners
   */
  public dispose(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe())
    this.unsubscribers = []
    this.audioEngine.dispose()
    this.initialized = false
  }
}

/**
 * Hook for React components to use the connector
 * 
 * @example
 * ```tsx
 * function PadGrid() {
 *   const connector = useAudioStoreConnector()
 *   
 *   const handlePadClick = (padIndex: number) => {
 *     connector.triggerPad(padIndex)
 *   }
 * }
 * ```
 */
export function useAudioStoreConnector(): AudioStoreConnector {
  return AudioStoreConnector.getInstance()
}

export default AudioStoreConnector

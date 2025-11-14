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
import { LoopManager } from '@/lib/audio/LoopManager'
import { useAppStore } from '@/lib/store'
import { EventBus } from '@/lib/events/EventBus'
import { ERROR_CODES } from '@/lib/constants'
import type { PadIndex } from '@/types'
import type { KitType } from '@/types'

type UnsubscribeCallback = () => void

/**
 * AudioStoreConnector manages the relationship between AudioEngine and Zustand
 */
export class AudioStoreConnector {
  private static instance: AudioStoreConnector
  private audioEngine: AudioEngine
  private loopManager: LoopManager
  private unsubscribers: UnsubscribeCallback[] = []
  private initialized = false

  private constructor() {
    this.audioEngine = AudioEngine.getInstance()
    this.loopManager = LoopManager.getInstance()
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
      // AudioEngine should already be initialized by the caller
      // We just need to set up listeners and sync state

      // Set up store → audio listeners
      this.setupStoreListeners()

      // Set up audio → store listeners
      this.setupAudioListeners()

      // Pre-load all kits so they're available immediately
      console.log('Pre-loading all kits...')
      const kits: KitType[] = ['drums', 'piano', 'synth']
      for (const kit of kits) {
        try {
          console.log(`Loading kit: ${kit}`)
          await this.audioEngine.switchKit(kit)
        } catch (error) {
          console.error(`Failed to pre-load kit ${kit}:`, error)
        }
      }

      // Switch back to the initial kit
      const initialKit = useAppStore.getState().currentKit
      console.log(`Switching to initial kit: ${initialKit}`)
      await this.audioEngine.switchKit(initialKit)

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
    const store = useAppStore.getState

    // Listen to current kit changes
    let previousState = store()
    const unsubscribeKit = useAppStore.subscribe((state) => {
      if (state.currentKit !== previousState.currentKit) {
        previousState = state
        this.handleKitChange(state.currentKit)
      }
    })
    this.unsubscribers.push(unsubscribeKit)

    // Listen to master volume changes
    let previousVolume = previousState.masterVolume
    const unsubscribeVolume = useAppStore.subscribe((state) => {
      if (state.masterVolume !== previousVolume) {
        previousVolume = state.masterVolume
        this.audioEngine.setMasterVolume(state.masterVolume)
        EventBus.emit('audio:volumeChanged', { volume: state.masterVolume })
      }
    })
    this.unsubscribers.push(unsubscribeVolume)

    // Listen to BPM changes
    let previousBPM = previousState.bpm
    const unsubscribeBPM = useAppStore.subscribe((state) => {
      if (state.bpm !== previousBPM) {
        previousBPM = state.bpm
        this.audioEngine.setBPM(state.bpm)
        EventBus.emit('audio:bpmChanged', { bpm: state.bpm })
      }
    })
    this.unsubscribers.push(unsubscribeBPM)

    // Listen to recording state changes
    let previousRecording = previousState.isRecording
    const unsubscribeRecording = useAppStore.subscribe((state) => {
      if (state.isRecording !== previousRecording) {
        previousRecording = state.isRecording
        if (state.isRecording) {
          // Start recording in AudioEngine
          this.audioEngine.startRecording()
          EventBus.emit('recording:started')
          console.log('🔴 Recording started via store')
        } else {
          // Stop recording and get the recorded loop data
          const loopData = this.audioEngine.stopRecording()
          console.log('⏹️ Recording stopped via store, events:', loopData?.events.length || 0)
          
          // Save the recorded events to the store's currentLoop
          if (loopData && loopData.events.length > 0) {
            // Clear existing currentLoop and add all recorded events
            useAppStore.getState().clearCurrentLoop()
            loopData.events.forEach(event => {
              useAppStore.getState().addRecordedEvent(event)
            })
            console.log(`✅ Saved ${loopData.events.length} events to currentLoop`)
          }
          
          EventBus.emit('recording:stopped', { loopData })
        }
      }
    })
    this.unsubscribers.push(unsubscribeRecording)

    // Listen to playing state changes
    let previousPlaying = previousState.isPlaying
    const unsubscribePlaying = useAppStore.subscribe((state) => {
      if (state.isPlaying !== previousPlaying) {
        previousPlaying = state.isPlaying
        if (state.isPlaying) {
          // Play ALL saved loops using LoopManager
          console.log(`▶️ Playing ${state.savedLoops.length} saved loops`)
          if (state.savedLoops.length === 0) {
            console.warn('⚠️ No loops to play')
            useAppStore.getState().setPlaying(false) // Auto-stop if no loops
          } else {
            this.loopManager.playAllLoops(state.savedLoops)
          }
          EventBus.emit('playback:started')
        } else {
          // Stop all loops
          console.log('⏹️ Stopping all loops')
          this.loopManager.stopAllLoops()
          EventBus.emit('playback:stopped')
        }
      }
    })
    this.unsubscribers.push(unsubscribePlaying)
  }

  /**
   * Set up listeners for audio events → update store
   */
  private setupAudioListeners(): void {
    const store = useAppStore

    // Listen to pad triggers (from hand tracking)
    EventBus.on('gesture:padTriggered', ({ padIndex, velocity }: { padIndex: PadIndex; velocity: number }) => {
      const state = store.getState()
      this.audioEngine.triggerPad(padIndex, state.currentKit, velocity)
      
      // NOTE: Recording is handled internally by AudioEngine.triggerPad()
      // which calls recordEvent() when this.isRecording is true
      // No need to duplicate recording logic here
    })

    // Listen to loop stack changes
    EventBus.on('loops:stateChanged', () => {
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
  public triggerPad(padIndex: PadIndex, velocity: number = 1): void {
    const state = useAppStore.getState()
    this.audioEngine.triggerPad(padIndex, state.currentKit, velocity)
    
    // NOTE: Recording is handled internally by AudioEngine.triggerPad()
    // The recorded events are added to the store when recording stops
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


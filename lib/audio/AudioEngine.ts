import * as Tone from 'tone'
import { IAudioEngine, KitType, PadIndex, RecordedEvent, LoopData } from '../../types/audio'
import { getSamplePath, generateId, msToSeconds } from '../utils/helpers'

/**
 * Enhanced AudioEngine implementing singleton pattern with improved architecture
 */
export class AudioEngine implements IAudioEngine {
  private static instance: AudioEngine
  private players: Map<string, Tone.Player> = new Map()
  private limiter!: Tone.Limiter
  private compressor!: Tone.Compressor
  private reverb!: Tone.Reverb
  private delay!: Tone.FeedbackDelay
  private masterGain!: Tone.Gain
  private isInitialized = false
  private currentKit: KitType = 'drums'
  
  // Loop management
  private activeLoops: Map<string, Tone.Loop> = new Map()
  private recordingStartTime = 0
  private isRecording = false
  
  // Performance optimization
  private loadedKits: Set<KitType> = new Set()
  
  private constructor() {
    this.setupAudioChain()
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  private setupAudioChain(): void {
    try {
      // Create audio effects chain
      this.masterGain = new Tone.Gain(0.8)
      this.compressor = new Tone.Compressor(-24, 3)
      this.reverb = new Tone.Reverb(1.5)
      this.delay = new Tone.FeedbackDelay(0.125, 0.2)
      this.limiter = new Tone.Limiter(-6)

      // Connect audio chain: master -> compressor -> reverb -> delay -> limiter -> destination
      this.masterGain
        .connect(this.compressor)
        .connect(this.reverb)
        .connect(this.delay)
        .connect(this.limiter)
        .toDestination()

      // Configure Tone.js Transport
      Tone.Transport.bpm.value = 120
      Tone.Transport.swing = 0
      Tone.Transport.swingSubdivision = '8n'
      
    } catch (error) {
      console.error('Failed to setup audio chain:', error)
      throw error
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Start Tone.js audio context
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }

      // Preload the default drum kit
      await this.loadKit(this.currentKit)
      
      this.isInitialized = true
      console.log('AudioEngine initialized successfully')
    } catch (error) {
      const audioError = new AudioEngineError('INITIALIZATION_FAILED')
      audioError.details = error
      throw audioError
    }
  }

  public async switchKit(kitType: KitType): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('AudioEngine not initialized')
    }

    try {
      // Load kit if not already loaded
      if (!this.loadedKits.has(kitType)) {
        await this.loadKit(kitType)
      }
      
      this.currentKit = kitType
      console.log(`Switched to kit: ${kitType}`)
    } catch (error) {
      const audioError = new AudioEngineError('SAMPLE_LOAD_FAILED')
      audioError.details = { kitType, error }
      throw audioError
    }
  }

  private async loadKit(kitType: KitType): Promise<void> {
    const loadPromises: Promise<void>[] = []

    for (let padIndex = 0; padIndex < 9; padIndex++) {
      const samplePath = getSamplePath(kitType, padIndex)
      const playerKey = `${kitType}-${padIndex}`
      
      if (!this.players.has(playerKey) && samplePath) {
        const player = new Tone.Player({
          url: samplePath,
        }).connect(this.masterGain)
        
        this.players.set(playerKey, player)
        
        // Wait for sample to load
        // Note: Tone.js Player automatically loads samples asynchronously
        const loadPromise = new Promise<void>((resolve, reject) => {
          // Check if already loaded
          if (player.loaded) {
            resolve()
            return
          }
          
          // Poll for load completion (Tone.js doesn't provide promise-based loading)
          const checkInterval = setInterval(() => {
            if (player.loaded) {
              clearInterval(checkInterval)
              console.log(`Loaded: ${playerKey}`)
              resolve()
            }
          }, 50)
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval)
            if (!player.loaded) {
              console.warn(`Timeout loading ${playerKey}`)
              reject(new Error(`Timeout loading ${playerKey}`))
            }
          }, 5000)
        })
        
        loadPromises.push(loadPromise)
      }
    }

    if (loadPromises.length > 0) {
      await Promise.all(loadPromises)
      this.loadedKits.add(kitType)
      console.log(`Kit loaded: ${kitType}`)
    }
  }

  public triggerPad(
    padIndex: PadIndex, 
    kitType: KitType = this.currentKit, 
    velocity: number = 1
  ): void {
    if (!this.isInitialized) {
      console.warn('AudioEngine not initialized')
      return
    }

    const playerKey = `${kitType}-${padIndex}`
    const player = this.players.get(playerKey)
    
    if (player && player.loaded) {
      try {
        // Apply velocity to volume
        const originalVolume = player.volume.value
        player.volume.value = originalVolume + (velocity - 1) * 6 // Max +6dB boost
        
        // Trigger sample immediately with minimal latency
        // Using player.start() without time parameter triggers ASAP
        player.start()
        
        // Reset volume after a short delay
        setTimeout(() => {
          if (player && !player.disposed) {
            player.volume.value = originalVolume
          }
        }, 10)
        
        // Record event if recording
        if (this.isRecording) {
          this.recordEvent(padIndex, kitType, velocity)
        }
        
      } catch (error) {
        console.error(`Failed to trigger pad ${padIndex}:`, error)
      }
    } else {
      console.warn(`Sample not found or loaded: ${playerKey}`)
    }
  }

  public startRecording(): void {
    this.isRecording = true
    this.recordingStartTime = Tone.now()
    console.log('Recording started')
  }

  public stopRecording(): LoopData | null {
    if (!this.isRecording) return null
    
    this.isRecording = false
    const duration = (Tone.now() - this.recordingStartTime) * 1000 // Convert to ms
    
    // Get recorded events from external source (this will be managed by the state store)
    // For now, return a placeholder
    const loopData: LoopData = {
      id: generateId(),
      events: [], // Will be populated by the store
      duration,
      bpm: Tone.Transport.bpm.value,
      createdAt: new Date()
    }
    
    console.log(`Recording stopped. Duration: ${duration}ms`)
    return loopData
  }

  private recordEvent(padIndex: PadIndex, kitType: KitType, velocity: number = 1): void {
    // This will be handled by the state management system
    // The audio engine just provides the timing
    const timestamp = (Tone.now() - this.recordingStartTime) * 1000
    
    // Emit event to be captured by the app store
    window.dispatchEvent(new CustomEvent('audioEvent', {
      detail: {
        padIndex,
        timestamp,
        kitType,
        velocity
      }
    }))
  }

  public playLoop(loopId: string, events: RecordedEvent[]): void {
    if (this.activeLoops.has(loopId)) {
      console.warn(`Loop ${loopId} is already playing`)
      return
    }

    try {
      const loop = new Tone.Loop((time) => {
        events.forEach(event => {
          Tone.Transport.schedule(() => {
            this.triggerPad(event.padIndex, event.kitType, event.velocity)
          }, time + msToSeconds(event.timestamp))
        })
      }, `${Math.max(...events.map(e => e.timestamp)) / 1000}s`)

      this.activeLoops.set(loopId, loop)
      loop.start()

      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start()
      }

      console.log(`Started playing loop: ${loopId}`)
    } catch (error) {
      console.error(`Failed to play loop ${loopId}:`, error)
    }
  }

  public stopLoop(loopId: string): void {
    const loop = this.activeLoops.get(loopId)
    if (loop) {
      loop.stop()
      loop.dispose()
      this.activeLoops.delete(loopId)
      console.log(`Stopped loop: ${loopId}`)
    }

    // Stop transport if no loops are active
    if (this.activeLoops.size === 0) {
      Tone.Transport.stop()
    }
  }

  public stopAllLoops(): void {
    this.activeLoops.forEach((loop) => {
      loop.stop()
      loop.dispose()
    })
    this.activeLoops.clear()
    Tone.Transport.stop()
    Tone.Transport.cancel()
    console.log('All loops stopped')
  }

  public setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.masterGain.gain.rampTo(clampedVolume, 0.1)
  }

  public setBPM(bpm: number): void {
    const clampedBPM = Math.max(60, Math.min(200, bpm))
    Tone.Transport.bpm.rampTo(clampedBPM, 2)
  }

  public getTransportTime(): string {
    return Tone.Transport.position.toString()
  }

  public isPlaying(): boolean {
    return Tone.Transport.state === 'started'
  }

  public pause(): void {
    Tone.Transport.pause()
  }

  public resume(): void {
    Tone.Transport.start()
  }

  public dispose(): void {
    // Clean up all resources
    this.stopAllLoops()
    
    this.players.forEach(player => {
      player.dispose()
    })
    this.players.clear()
    
    this.masterGain?.dispose()
    this.compressor?.dispose()
    this.reverb?.dispose()
    this.delay?.dispose()
    this.limiter?.dispose()
    
    this.isInitialized = false
    AudioEngine.instance = null as any
    
    console.log('AudioEngine disposed')
  }
}

// Create custom error class
export class AudioEngineError extends Error {
  public code: 'INITIALIZATION_FAILED' | 'SAMPLE_LOAD_FAILED' | 'PLAYBACK_FAILED'
  public details?: any

  constructor(code: AudioEngineError['code'], message?: string) {
    super(message || `AudioEngine error: ${code}`)
    this.name = 'AudioEngineError'
    this.code = code
  }
}

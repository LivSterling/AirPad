import * as Tone from 'tone'
import { IAudioEngine, KitType, PadIndex, RecordedEvent, LoopData } from '../../types/audio'
import { getSamplePath, generateId } from '../utils/helpers'

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
  private recordedEvents: RecordedEvent[] = []
  private masterLoopLength = 0  // Master loop length in milliseconds
  
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
      console.log(`🔄 Switching to kit: ${kitType}`)
      console.log(`   Already loaded: ${Array.from(this.loadedKits)}`)
      
      // Load kit if not already loaded
      if (!this.loadedKits.has(kitType)) {
        console.log(`   ⬇️ Loading ${kitType} kit...`)
        await this.loadKit(kitType)
        console.log(`   ✓ ${kitType} kit loaded successfully`)
      } else {
        console.log(`   ⏩ ${kitType} already loaded, skipping`)
      }
      
      this.currentKit = kitType
      console.log(`✓ Switched to kit: ${kitType}`)
    } catch (error) {
      console.error(`❌ Failed to switch to ${kitType}:`, error)
      throw error
    }
  }

  private async loadKit(kitType: KitType): Promise<void> {
    console.log(`📦 Loading kit: ${kitType}`)
    const loadPromises: Promise<void>[] = []

    for (let padIndex = 0; padIndex < 9; padIndex++) {
      const samplePath = getSamplePath(kitType, padIndex)
      const playerKey = `${kitType}-${padIndex}`
      
      console.log(`   Pad ${padIndex}: path="${samplePath}" key="${playerKey}" exists=${this.players.has(playerKey)}`)
      
      if (!this.players.has(playerKey) && samplePath) {
        console.log(`      → Creating player for ${playerKey}`)
        const player = new Tone.Player({
          url: samplePath,
          onload: () => {
            console.log(`      ✓ onload callback: ${playerKey}`)
          },
          onerror: (err: any) => {
            console.error(`      ❌ onerror callback for ${playerKey}:`, err)
          }
        }).connect(this.masterGain)
        
        this.players.set(playerKey, player)
        console.log(`      ✓ Player created. Total players now: ${this.players.size}`)
        
        // Wait for sample to load
        const loadPromise = new Promise<void>((resolve, reject) => {
          let isResolved = false
          
          // Set timeout
          const timeoutId = setTimeout(() => {
            if (!isResolved) {
              isResolved = true
              console.warn(`⏱ Timeout loading ${playerKey} (${samplePath})`)
              reject(new Error(`Timeout loading ${playerKey}`))
            }
          }, 8000)
          
          // Poll for load completion
          const pollInterval = setInterval(() => {
            if (player.loaded && !isResolved) {
              isResolved = true
              clearInterval(pollInterval)
              clearTimeout(timeoutId)
              console.log(`      ✓ Loaded: ${playerKey}`)
              resolve()
            }
          }, 100)
        })
        
        loadPromises.push(loadPromise)
      } else if (this.players.has(playerKey)) {
        console.log(`      ⏩ Already exists`)
      }
    }

    if (loadPromises.length > 0) {
      console.log(`   Waiting for ${loadPromises.length} samples to load...`)
      try {
        await Promise.all(loadPromises)
        this.loadedKits.add(kitType)
        console.log(`✓ Kit loaded: ${kitType}`)
      } catch (error) {
        console.error(`❌ Error loading kit ${kitType}:`, error)
        throw error
      }
    } else {
      console.log(`   No new samples to load`)
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
        // PERFORMANCE OPTIMIZATION: Use Tone.js built-in velocity instead of volume manipulation
        // This avoids setTimeout overhead and ensures samples play at consistent volume
        player.volume.value = -10 + (velocity * 10) // -10dB to 0dB range
        
        // Trigger sample with minimal latency
        // Using Tone.now() + small offset for precise timing
        const now = Tone.now()
        player.start(now)
        
        // Record event if recording (done synchronously for accuracy)
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
    this.recordedEvents = []
    this.masterLoopLength = 0  // Reset master loop
    this.recordingStartTime = Tone.now()
    console.log('Recording started')
  }

  public stopRecording(): LoopData | null {
    if (!this.isRecording) return null
    
    this.isRecording = false
    const duration = (Tone.now() - this.recordingStartTime) * 1000 // Convert to ms
    
    // Set master loop length on first recording
    if (this.masterLoopLength === 0) {
      this.masterLoopLength = duration
      console.log(`Master loop length set to ${duration}ms`)
    }
    
    // Create loop data with captured events
    const loopData: LoopData = {
      id: generateId(),
      events: this.recordedEvents,
      duration: this.masterLoopLength, // Use master loop length, not actual duration
      bpm: Tone.Transport.bpm.value,
      createdAt: new Date(),
      name: `Loop ${this.recordedEvents.length} events`
    }
    
    console.log(`Recording stopped. Loop length: ${this.masterLoopLength}ms, Events: ${this.recordedEvents.length}`)
    this.recordedEvents = [] // Clear for next recording
    return loopData
  }

  private recordEvent(padIndex: PadIndex, kitType: KitType, velocity: number = 1): void {
    if (!this.isRecording) return
    
    // Calculate timestamp relative to recording start
    const timestamp = (Tone.now() - this.recordingStartTime) * 1000
    
    // Create and store the event
    const event: RecordedEvent = {
      padIndex,
      timestamp,
      kitType,
      velocity
    }
    
    this.recordedEvents.push(event)
    console.log(`Recorded event: Pad ${padIndex}, T: ${timestamp.toFixed(0)}ms`)
  }

  public playLoop(loopId: string, events: RecordedEvent[]): void {
    if (this.activeLoops.has(loopId)) {
      console.warn(`Loop ${loopId} is already playing`)
      return
    }

    try {
      // Calculate loop duration from events
      const maxEventTime = Math.max(...events.map(e => e.timestamp), 1000)
      const loopDuration = this.masterLoopLength || maxEventTime
      
      // Create Tone.js loop with modulo timing for subsequent takes
      const loop = new Tone.Loop((time) => {
        events.forEach(event => {
          // Schedule event with modulo timing so it repeats properly
          const eventTime = (event.timestamp % loopDuration) / 1000 // Convert to seconds
          Tone.Transport.schedule(() => {
            this.triggerPad(event.padIndex, event.kitType, event.velocity || 1)
          }, time + eventTime)
        })
      }, `${loopDuration / 1000}s`)

      this.activeLoops.set(loopId, loop)
      loop.start()

      // Ensure transport is running
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start()
      }

      console.log(`Started playing loop: ${loopId} (duration: ${loopDuration.toFixed(0)}ms)`)
    } catch (error) {
      console.error(`Failed to play loop ${loopId}:`, error)
      throw new Error(`Failed to play loop: ${error}`)
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
  }

  public stopAllLoops(): void {
    this.activeLoops.forEach((_loop, loopId) => {
      this.stopLoop(loopId)
    })
  }

  /**
   * Set master loop length (in milliseconds)
   * Used to synchronize all subsequent recordings/loops
   */
  public setMasterLoopLength(lengthMs: number): void {
    if (lengthMs > 0) {
      this.masterLoopLength = lengthMs
      console.log(`Master loop length set to ${lengthMs}ms (${(lengthMs / 1000).toFixed(1)}s)`)
    }
  }

  /**
   * Get current master loop length
   */
  public getMasterLoopLength(): number {
    return this.masterLoopLength
  }

  /**
   * Get recorded events from current recording session
   */
  public getRecordedEvents(): RecordedEvent[] {
    return [...this.recordedEvents]
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


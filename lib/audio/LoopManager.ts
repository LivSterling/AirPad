/**
 * Loop Manager
 * 
 * Manages loop stacking, playback, and synchronization
 * - Handles multiple concurrent loops
 * - Synchronizes loop playback with master tempo
 * - Manages loop layer control
 */

import { LoopData } from '@/types'
import { AudioEngine } from './AudioEngine'
import { EventBus } from '@/lib/events/EventBus'

export class LoopManager {
  private static instance: LoopManager
  private audioEngine: AudioEngine
  private playingLoops: Map<string, LoopData> = new Map()
  private masterBPM: number = 120
  private isPlaying: boolean = false

  private constructor() {
    this.audioEngine = AudioEngine.getInstance()
  }

  public static getInstance(): LoopManager {
    if (!LoopManager.instance) {
      LoopManager.instance = new LoopManager()
    }
    return LoopManager.instance
  }

  /**
   * Play a single loop
   */
  public playLoop(loop: LoopData): void {
    try {
      // Prevent duplicate playback
      if (this.playingLoops.has(loop.id)) {
        console.warn(`Loop ${loop.id} is already playing`)
        return
      }

      // Play loop through audio engine
      this.audioEngine.playLoop(loop.id, loop.events)
      this.playingLoops.set(loop.id, loop)

      // Emit event for UI updates
      EventBus.emit('loops:started', { loopId: loop.id, loopName: loop.name })
      console.log(`▶ Started loop: ${loop.name || loop.id}`)
    } catch (error) {
      console.error(`Failed to play loop ${loop.id}:`, error)
      EventBus.emit('error:loopPlayback', {
        error: `Failed to play loop: ${error}`,
        loopId: loop.id
      })
    }
  }

  /**
   * Play all loops in a stack (for "play all" command)
   */
  public playAllLoops(loops: LoopData[]): void {
    if (loops.length === 0) {
      console.warn('No loops to play')
      return
    }

    try {
      // Stop any currently playing loops first
      this.stopAllLoops()

      // Play each loop in sequence
      loops.forEach((loop, index) => {
        setTimeout(() => {
          this.playLoop(loop)
        }, index * 100) // Slight stagger to prevent overlapping starts
      })

      this.isPlaying = true
      EventBus.emit('playback:allStarted', { count: loops.length })
      console.log(`▶ Started playback of ${loops.length} loops`)
    } catch (error) {
      console.error('Failed to play all loops:', error)
      EventBus.emit('error:loopPlayback', {
        error: `Failed to play loops: ${error}`,
        count: loops.length
      })
    }
  }

  /**
   * Stop a specific loop
   */
  public stopLoop(loopId: string): void {
    if (!this.playingLoops.has(loopId)) {
      console.warn(`Loop ${loopId} is not playing`)
      return
    }

    this.audioEngine.stopLoop(loopId)
    this.playingLoops.delete(loopId)

    EventBus.emit('loops:stopped', { loopId })
    console.log(`⏹ Stopped loop: ${loopId}`)
  }

  /**
   * Stop all playing loops
   */
  public stopAllLoops(): void {
    this.audioEngine.stopAllLoops()
    this.playingLoops.clear()
    this.isPlaying = false

    EventBus.emit('playback:allStopped', {})
    console.log('⏹ Stopped all loops')
  }

  /**
   * Get all currently playing loops
   */
  public getPlayingLoops(): LoopData[] {
    return Array.from(this.playingLoops.values())
  }

  /**
   * Check if a specific loop is playing
   */
  public isLoopPlaying(loopId: string): boolean {
    return this.playingLoops.has(loopId)
  }

  /**
   * Get playback state
   */
  public isPlayingAny(): boolean {
    return this.isPlaying && this.playingLoops.size > 0
  }

  /**
   * Set master BPM for loop synchronization
   */
  public setBPM(bpm: number): void {
    this.masterBPM = Math.max(60, Math.min(200, bpm))
    this.audioEngine.setBPM(this.masterBPM)
    console.log(`🎵 BPM set to ${this.masterBPM}`)
  }

  /**
   * Get current BPM
   */
  public getBPM(): number {
    return this.masterBPM
  }

  /**
   * Set master loop length for synchronization
   */
  public setMasterLoopLength(lengthMs: number): void {
    this.audioEngine.setMasterLoopLength(lengthMs)
  }

  /**
   * Get master loop length
   */
  public getMasterLoopLength(): number {
    return this.audioEngine.getMasterLoopLength()
  }

  /**
   * Clear all playing loops and reset state
   */
  public reset(): void {
    this.stopAllLoops()
    this.playingLoops.clear()
    this.isPlaying = false
  }

  /**
   * Get loop statistics
   */
  public getStats() {
    return {
      playingCount: this.playingLoops.size,
      isPlaying: this.isPlayingAny(),
      masterBPM: this.masterBPM,
      masterLoopLength: this.audioEngine.getMasterLoopLength()
    }
  }
}

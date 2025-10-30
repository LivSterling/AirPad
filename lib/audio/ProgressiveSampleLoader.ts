/**
 * ProgressiveSampleLoader
 * 
 * Implements progressive sample loading strategy to reduce initial load time.
 * Preloads critical samples (drums) and lazy-loads others on demand.
 * Task 3.2 from Audio Engine Foundation.
 */

import * as Tone from 'tone'
import { EventBus } from '@/lib/events/EventBus'

export interface SampleLoadProgress {
  total: number
  loaded: number
  percentage: number
  currentKit: string
  status: 'idle' | 'loading' | 'complete' | 'error'
}

export interface SampleCache {
  [kitName: string]: {
    [sampleName: string]: Tone.Sampler
  }
}

/**
 * Progressive sample loader singleton
 */
export class ProgressiveSampleLoader {
  private static instance: ProgressiveSampleLoader
  private sampleCache: SampleCache = {}
  private loadQueue: Map<string, Promise<void>> = new Map()
  private preloadedKits: Set<string> = new Set()
  private loadProgress: SampleLoadProgress = {
    total: 0,
    loaded: 0,
    percentage: 0,
    currentKit: '',
    status: 'idle',
  }

  private constructor() {}

  public static getInstance(): ProgressiveSampleLoader {
    if (!ProgressiveSampleLoader.instance) {
      ProgressiveSampleLoader.instance = new ProgressiveSampleLoader()
    }
    return ProgressiveSampleLoader.instance
  }

  /**
   * Preload critical kit samples (drums) on app startup
   */
  public async preloadCriticalKit(kitName: string, samples: Record<string, string>): Promise<void> {
    if (this.preloadedKits.has(kitName)) {
      return
    }

    console.log(`⏳ Preloading critical kit: ${kitName}`)
    this.loadProgress.status = 'loading'
    this.loadProgress.currentKit = kitName

    try {
      const sampleEntries = Object.entries(samples)
      this.loadProgress.total = sampleEntries.length
      this.loadProgress.loaded = 0

      // Load samples sequentially with progress updates
      for (const [name, path] of sampleEntries) {
        await this.loadSample(kitName, name, path)
        this.loadProgress.loaded++
        this.loadProgress.percentage = Math.round((this.loadProgress.loaded / this.loadProgress.total) * 100)

        EventBus.emit('samples:loadProgress', this.loadProgress)
      }

      this.preloadedKits.add(kitName)
      this.loadProgress.status = 'complete'

      console.log(`✅ Preloaded kit: ${kitName}`)
      EventBus.emit('samples:preloadComplete', { kitName })
    } catch (error) {
      console.error(`Failed to preload kit ${kitName}:`, error)
      this.loadProgress.status = 'error'
      EventBus.emit('error:sampleLoad', {
        code: 'SAMPLE_PRELOAD_FAILED',
        kitName,
        originalError: error as Error,
      })
    }
  }

  /**
   * Lazy-load additional kit samples on demand
   */
  public async lazyLoadKit(kitName: string, samples: Record<string, string>): Promise<void> {
    // Check if already queued
    if (this.loadQueue.has(kitName)) {
      return this.loadQueue.get(kitName)!
    }

    // Check if already loaded
    if (this.sampleCache[kitName]) {
      return
    }

    console.log(`⏳ Lazy-loading kit: ${kitName}`)

    const loadPromise = (async () => {
      try {
        const sampleEntries = Object.entries(samples)
        this.sampleCache[kitName] = {}

        for (const [name, path] of sampleEntries) {
          await this.loadSample(kitName, name, path)
        }

        console.log(`✅ Lazy-loaded kit: ${kitName}`)
        EventBus.emit('samples:lazyLoadComplete', { kitName })
      } catch (error) {
        console.error(`Failed to lazy-load kit ${kitName}:`, error)
        EventBus.emit('error:sampleLoad', {
          code: 'SAMPLE_LAZY_LOAD_FAILED',
          kitName,
          originalError: error as Error,
        })
      } finally {
        this.loadQueue.delete(kitName)
      }
    })()

    this.loadQueue.set(kitName, loadPromise)
    return loadPromise
  }

  /**
   * Load individual sample
   */
  private async loadSample(kitName: string, sampleName: string, samplePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create directory structure if needed
        if (!this.sampleCache[kitName]) {
          this.sampleCache[kitName] = {}
        }

        // Skip if already cached
        if (this.sampleCache[kitName][sampleName]) {
          resolve()
          return
        }

        // Create Tone.js buffer with loading timeout
        const loadTimeout = setTimeout(
          () => reject(new Error(`Sample load timeout: ${samplePath}`)),
          10000 // 10 second timeout
        )

        const sampler = new Tone.Sampler(
          {
            [sampleName]: samplePath,
          },
          {
            onload: () => {
              clearTimeout(loadTimeout)
              this.sampleCache[kitName][sampleName] = sampler
              console.log(`  ✓ Loaded: ${sampleName}`)
              resolve()
            },
            onerror: (error) => {
              clearTimeout(loadTimeout)
              console.error(`  ✗ Failed to load ${sampleName}:`, error)
              reject(error)
            },
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Get cached sample
   */
  public getSample(kitName: string, sampleName: string): Tone.Sampler | undefined {
    return this.sampleCache[kitName]?.[sampleName]
  }

  /**
   * Check if kit is preloaded
   */
  public isPreloaded(kitName: string): boolean {
    return this.preloadedKits.has(kitName)
  }

  /**
   * Check if kit is loading
   */
  public isLoading(kitName: string): boolean {
    return this.loadQueue.has(kitName)
  }

  /**
   * Get load progress
   */
  public getProgress(): SampleLoadProgress {
    return { ...this.loadProgress }
  }

  /**
   * Clear cache and reset
   */
  public clear(): void {
    // Dispose all samplers
    Object.values(this.sampleCache).forEach((kit) => {
      Object.values(kit).forEach((sampler) => {
        sampler.dispose()
      })
    })

    this.sampleCache = {}
    this.preloadedKits.clear()
    this.loadQueue.clear()
    this.loadProgress = {
      total: 0,
      loaded: 0,
      percentage: 0,
      currentKit: '',
      status: 'idle',
    }

    console.log('✅ Sample cache cleared')
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    let totalSamples = 0
    let totalKits = 0

    Object.entries(this.sampleCache).forEach(([kit, samples]) => {
      totalKits++
      totalSamples += Object.keys(samples).length
    })

    return {
      totalKits,
      totalSamples,
      preloadedKits: Array.from(this.preloadedKits),
      loadingKits: Array.from(this.loadQueue.keys()),
    }
  }
}

export default ProgressiveSampleLoader

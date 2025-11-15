import { KitType, KitConfig } from '../../types/audio'
import { getKitConfig } from '../utils/helpers'

/**
 * Manages kit configurations and switching logic
 */
export class KitManager {
  private static instance: KitManager
  private availableKits: Map<KitType, KitConfig> = new Map()
  
  private constructor() {
    this.initializeKits()
  }

  public static getInstance(): KitManager {
    if (!KitManager.instance) {
      KitManager.instance = new KitManager()
    }
    return KitManager.instance
  }

  private initializeKits(): void {
    // Initialize drum kit
    const drumConfig = getKitConfig('drums')
    this.availableKits.set('drums', {
      name: drumConfig.name,
      type: 'drums',
      samples: drumConfig.samples.map((sample: string) => `/kits/drums/${sample}`),
      metadata: {
        bpm: 120,
        key: 'C',
        genre: 'Electronic'
      }
    })

    // Initialize piano kit
    const pianoConfig = getKitConfig('piano')
    this.availableKits.set('piano', {
      name: pianoConfig.name,
      type: 'piano',
      samples: pianoConfig.samples.map((sample: string) => `/kits/piano/${sample}`),
      metadata: {
        bpm: 120,
        key: 'C',
        genre: 'Classical'
      }
    })

    // Initialize funk kit (uses synth folder for audio files)
    const funkConfig = getKitConfig('funk')
    this.availableKits.set('funk', {
      name: funkConfig.name,
      type: 'funk',
      samples: funkConfig.samples.map((sample: string) => `/kits/synth/${sample}`),
      metadata: {
        bpm: 128,
        key: 'C',
        genre: 'Brazilian Funk'
      }
    })
  }

  public getKit(kitType: KitType): KitConfig | undefined {
    return this.availableKits.get(kitType)
  }

  public getAllKits(): KitConfig[] {
    return Array.from(this.availableKits.values())
  }

  public getKitTypes(): KitType[] {
    return Array.from(this.availableKits.keys())
  }

  public validateKitType(kitType: string): kitType is KitType {
    return this.availableKits.has(kitType as KitType)
  }

  public getNextKit(currentKit: KitType): KitType {
    const types = this.getKitTypes()
    const currentIndex = types.indexOf(currentKit)
    return types[(currentIndex + 1) % types.length] as KitType
  }

  public getPreviousKit(currentKit: KitType): KitType {
    const types = this.getKitTypes()
    const currentIndex = types.indexOf(currentKit)
    return types[(currentIndex - 1 + types.length) % types.length] as KitType
  }

  public getSamplePaths(kitType: KitType): string[] {
    const kit = this.getKit(kitType)
    return kit ? kit.samples : []
  }

  public getKitMetadata(kitType: KitType) {
    const kit = this.getKit(kitType)
    return kit ? kit.metadata : null
  }

  public addCustomKit(kit: KitConfig): boolean {
    if (this.availableKits.has(kit.type)) {
      console.warn(`Kit ${kit.type} already exists`)
      return false
    }

    this.availableKits.set(kit.type, kit)
    return true
  }

  public removeKit(kitType: KitType): boolean {
    if (['drums', 'piano', 'funk'].includes(kitType)) {
      console.warn(`Cannot remove default kit: ${kitType}`)
      return false
    }

    return this.availableKits.delete(kitType)
  }
}

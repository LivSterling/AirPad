// Utility functions for AirPad MVP

import { KitType } from '../../types/audio'

/**
 * Generate a unique ID for loops and other entities
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Convert milliseconds to seconds with precision
 */
export const msToSeconds = (ms: number, precision: number = 3): number => {
  return Number((ms / 1000).toFixed(precision))
}

/**
 * Convert seconds to milliseconds
 */
export const secondsToMs = (seconds: number): number => {
  return seconds * 1000
}

/**
 * Format time as MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate BPM from time interval
 */
export const calculateBPM = (intervalMs: number): number => {
  if (intervalMs <= 0) return 120 // Default BPM
  return Math.round(60000 / intervalMs)
}

/**
 * Get kit configuration
 */
export const getKitConfig = (kitType: KitType) => {
  const configs = {
    drums: {
      name: 'Drum Kit',
      // Map to actual drum kit files
      samples: [
        'kick-drum-105.wav',                           // Pad 0: Kick
        'short-percussive-trap-snare-one-shot.wav',  // Pad 1: Snare
        'open-hat-high.wav',                           // Pad 2: Hi-Hat
        'flame-phonk-kick_D#_major.wav',              // Pad 3: Secondary Kick
        'clean-808-trap-clap.wav',                     // Pad 4: Clap
        'short-808-bass-boom_C_major.wav',            // Pad 5: Bass
        'stomping-grind-808_103bpm_E_minor.wav',     // Pad 6: Grind
        'kick-drum-118_F_minor.wav',                   // Pad 7: Alt Kick
        'female-vocal-singing-loop-want_125bpm_A_minor.wav' // Pad 8: Vocal
      ],
      labels: [
        'Kick',
        'Snare',
        'Hi-Hat',
        'Kick 2',
        'Clap',
        'Bass',
        'Grind',
        'Kick 3',
        'Vocal'
      ]
    },
    piano: {
      name: 'Piano',
      // Map to actual piano/melodic files
      samples: [
        'piano-c_C_major.wav',                        // Pad 0: C
        'piano-eb_D#_major.wav',                      // Pad 1: D#
        'piano-f_F_major.wav',                        // Pad 2: F
        'piano-g_G_major.wav',                        // Pad 3: G
        'piano-bb_A#_major.wav',                      // Pad 4: A#
        'playful-drama-wet-choir_120bpm_A_minor.wav', // Pad 5: Choir
        'piano-g_G#_major.wav',                       // Pad 6: G#
        'brazilian-funk-vocal-baile_130bpm_D_minor.wav', // Pad 7: Vocal
        'female-dry-vocals-dnb_120bpm_D#_minor.wav'  // Pad 8: Vocals
      ],
      labels: [
        'C',
        'D#',
        'F',
        'G',
        'A#',
        'Choir',
        'G#',
        'Vocal 1',
        'Vocal 2'
      ]
    },
    synth: {
      name: 'Synth',
      // Map to actual synth/electronic files
      samples: [
        'brazillian-funk-kick_130bpm_C_major.wav',        // Pad 0: Kick
        'brazilian-funk-snare.wav',                       // Pad 1: Snare
        'phonk-closed-hi-hats-thin_C_minor.wav',         // Pad 2: Hi-Hat
        'brazilian-funk-kick_121bpm_F_minor.wav',        // Pad 3: Secondary Kick
        'brazilian-funk-cowbell_C.wav',                  // Pad 4: Cowbell
        'aguda-brazilian-funk-synth_131bpm_A#_major.wav', // Pad 5: Synth
        'brazilian-boomy-vox-groove_99bpm_F_minor.wav',  // Pad 6: Groove
        'tight-kick-brazilian-funk-drums_119bpm_A_minor.wav', // Pad 7: Tight Kick
        'aggressive-brazilian-funk-acapella-dia-delicia_130bpm.wav' // Pad 8: Acapella
      ],
      labels: [
        'Kick',
        'Snare',
        'Hi-Hat',
        'Kick 2',
        'Cowbell',
        'Synth',
        'Groove',
        'Tight',
        'Acapella'
      ]
    }
  }
  
  return configs[kitType]
}

/**
 * Get sample path for kit and pad index
 */
export const getSamplePath = (kitType: KitType, padIndex: number): string => {
  const config = getKitConfig(kitType)
  if (padIndex < 0 || padIndex >= config.samples.length) {
    console.warn(`Invalid pad index ${padIndex} for kit ${kitType}`)
    return ''
  }
  return `/kits/${kitType}/${config.samples[padIndex]}`
}

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Check if gesture coordinates are within a zone
 */
export const isWithinZone = (
  x: number,
  y: number,
  zone: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    x >= zone.x &&
    x <= zone.x + zone.width &&
    y >= zone.y &&
    y <= zone.y + zone.height
  )
}

/**
 * Calculate distance between two points
 */
export const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Convert velocity to volume (0-1)
 */
export const velocityToVolume = (velocity: number, maxVelocity: number = 1): number => {
  return clamp(velocity / maxVelocity, 0, 1)
}

/**
 * Generate grid positions for pad layout
 */
export const generatePadPositions = (containerWidth: number, containerHeight: number) => {
  const positions = []
  const cols = 3
  const rows = 3
  const padSize = Math.min(containerWidth / cols, containerHeight / rows) * 0.8
  const spacingX = containerWidth / cols
  const spacingY = containerHeight / rows
  
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    positions.push({
      x: col * spacingX + (spacingX - padSize) / 2,
      y: row * spacingY + (spacingY - padSize) / 2,
      width: padSize,
      height: padSize
    })
  }
  
  return positions
}

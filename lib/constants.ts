/**
 * AirPad MVP - Application Constants
 * 
 * Centralized configuration values for the application.
 * These constants are used throughout the codebase to ensure consistency.
 * 
 * Values can be overridden by environment variables (see .env.local)
 */

// =============================================================================
// AUDIO ENGINE CONSTANTS
// =============================================================================

export const AUDIO = {
  // BPM (Beats Per Minute) configuration
  BPM: {
    MIN: 60,
    MAX: 200,
    DEFAULT: parseInt(process.env.NEXT_PUBLIC_DEFAULT_BPM || '120'),
    STEP: 1,
  },

  // Volume configuration (0-1 scale)
  VOLUME: {
    MIN: 0,
    MAX: 1,
    DEFAULT: parseFloat(process.env.NEXT_PUBLIC_MASTER_VOLUME || '0.8'),
    STEP: 0.1,
  },

  // Audio latency settings
  LATENCY: {
    HINT: (process.env.NEXT_PUBLIC_AUDIO_LATENCY_HINT || 'interactive') as AudioContextLatencyCategory,
    LOOKAHEAD: parseFloat(process.env.NEXT_PUBLIC_AUDIO_LOOKAHEAD || '0.1'), // seconds
    UPDATE_INTERVAL: parseFloat(process.env.NEXT_PUBLIC_AUDIO_UPDATE_INTERVAL || '0.05'), // seconds
    MAX_ACCEPTABLE_MS: parseInt(process.env.NEXT_PUBLIC_MAX_AUDIO_LATENCY_MS || '50'),
  },

  // Sample file configuration
  SAMPLES: {
    BASE_PATH: process.env.NEXT_PUBLIC_AUDIO_SAMPLES_PATH || '/Kits',
    FORMATS: ['wav', 'mp3', 'ogg'] as const,
  },

  // Audio effects parameters
  EFFECTS: {
    LIMITER: {
      THRESHOLD: -6, // dB
    },
    COMPRESSOR: {
      THRESHOLD: -24, // dB
      RATIO: 3,
    },
    REVERB: {
      DECAY: 1.5, // seconds
    },
    DELAY: {
      TIME: 0.125, // seconds (1/8 note)
      FEEDBACK: 0.2,
    },
  },
} as const

// =============================================================================
// GESTURE CONTROL CONSTANTS
// =============================================================================

export const GESTURE = {
  // Pinch detection
  PINCH: {
    THRESHOLD: parseFloat(process.env.NEXT_PUBLIC_PINCH_THRESHOLD || '0.04'),
    COOLDOWN_MS: parseInt(process.env.NEXT_PUBLIC_GESTURE_COOLDOWN_MS || '220'),
  },

  // Grid mapping calibration (0-1 normalized coordinates)
  GRID: {
    LEFT: parseFloat(process.env.NEXT_PUBLIC_GRID_LEFT || '0.3'),
    RIGHT: parseFloat(process.env.NEXT_PUBLIC_GRID_RIGHT || '0.7'),
    TOP: parseFloat(process.env.NEXT_PUBLIC_GRID_TOP || '0.2'),
    BOTTOM: parseFloat(process.env.NEXT_PUBLIC_GRID_BOTTOM || '0.6'),
  },

  // Hand tracking landmarks (MediaPipe indices)
  LANDMARKS: {
    THUMB_TIP: 4,
    INDEX_FINGER_TIP: 8,
    MIDDLE_FINGER_TIP: 12,
    RING_FINGER_TIP: 16,
    PINKY_TIP: 20,
  },

  // Latency thresholds
  LATENCY: {
    MAX_ACCEPTABLE_MS: parseInt(process.env.NEXT_PUBLIC_MAX_GESTURE_LATENCY_MS || '100'),
  },
} as const

// =============================================================================
// MEDIAPIPE CONFIGURATION
// =============================================================================

export const MEDIAPIPE = {
  CDN: process.env.NEXT_PUBLIC_MEDIAPIPE_CDN || 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  VERSION: process.env.NEXT_PUBLIC_MEDIAPIPE_HANDS_VERSION || '0.4',
  
  HANDS: {
    MAX_NUM_HANDS: parseInt(process.env.NEXT_PUBLIC_MEDIAPIPE_MAX_HANDS || '1'),
    MODEL_COMPLEXITY: parseInt(process.env.NEXT_PUBLIC_MEDIAPIPE_MODEL_COMPLEXITY || '0') as 0 | 1,
    MIN_DETECTION_CONFIDENCE: parseFloat(process.env.NEXT_PUBLIC_MEDIAPIPE_MIN_DETECTION_CONFIDENCE || '0.5'),
    MIN_TRACKING_CONFIDENCE: parseFloat(process.env.NEXT_PUBLIC_MEDIAPIPE_MIN_TRACKING_CONFIDENCE || '0.5'),
  },
} as const

// =============================================================================
// VOICE CONTROL CONSTANTS
// =============================================================================

export const VOICE = {
  LANGUAGE: process.env.NEXT_PUBLIC_VOICE_LANGUAGE || 'en-US',
  CONTINUOUS: process.env.NEXT_PUBLIC_VOICE_CONTINUOUS === 'true',
  INTERIM_RESULTS: process.env.NEXT_PUBLIC_VOICE_INTERIM_RESULTS === 'true',
  
  TTS: {
    RATE: parseFloat(process.env.NEXT_PUBLIC_TTS_RATE || '1.2'),
    PITCH: parseFloat(process.env.NEXT_PUBLIC_TTS_PITCH || '1.0'),
    VOLUME: parseFloat(process.env.NEXT_PUBLIC_TTS_VOLUME || '0.8'),
  },
} as const

// =============================================================================
// GRID & UI LAYOUT
// =============================================================================

export const GRID = {
  ROWS: 3,
  COLS: 3,
  TOTAL_PADS: 9,
  
  // Pad dimensions
  PAD: {
    SIZE: 120, // px
    GAP: 16, // px
    BORDER_RADIUS: 12, // px
  },
  
  // Aspect ratio
  ASPECT_RATIO: '1 / 1' as const,
} as const

// =============================================================================
// KIT TYPES
// =============================================================================

export const KITS = {
  TYPES: ['drums', 'piano', 'funk'] as const,
  DEFAULT: 'drums' as const,
  
  // Kit metadata
  METADATA: {
    drums: {
      name: 'Drum Kit',
      color: '#EC4899', // Pink 500
      icon: '🥁',
    },
    piano: {
      name: 'Piano',
      color: '#8B5CF6', // Violet 500
      icon: '🎹',
    },
    funk: {
      name: 'Funk Kit',
      color: '#06B6D4', // Cyan 500
      icon: '🎛️',
    },
  },
} as const

export type KitType = typeof KITS.TYPES[number]

// =============================================================================
// RECORDING & LOOP CONSTANTS
// =============================================================================

export const RECORDING = {
  // Loop length constraints
  MIN_LOOP_LENGTH_MS: 500, // 0.5 seconds
  MAX_LOOP_LENGTH_MS: 60000, // 60 seconds
  
  // Timing precision
  TIMING_PRECISION: 1, // milliseconds
  
  // Maximum loop layers
  MAX_LOOP_LAYERS: 10,
  
  // Quantization (optional, for future use)
  QUANTIZE: {
    ENABLED: false,
    DIVISIONS: 16, // 16th notes
  },
} as const

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

export const PERFORMANCE = {
  TARGET_FPS: parseInt(process.env.NEXT_PUBLIC_TARGET_FPS || '30'),
  
  // Thresholds for warnings
  THRESHOLDS: {
    FPS_WARNING: 20,
    FPS_CRITICAL: 10,
    AUDIO_LATENCY_WARNING_MS: 50,
    AUDIO_LATENCY_CRITICAL_MS: 100,
    GESTURE_LATENCY_WARNING_MS: 100,
    GESTURE_LATENCY_CRITICAL_MS: 200,
  },
  
  // Monitoring intervals
  SAMPLE_INTERVAL_MS: 1000, // How often to sample metrics
  REPORT_INTERVAL_MS: 5000, // How often to report metrics
} as const

// =============================================================================
// CAMERA SETTINGS
// =============================================================================

export const CAMERA = {
  WIDTH: parseInt(process.env.NEXT_PUBLIC_CAMERA_WIDTH || '640'),
  HEIGHT: parseInt(process.env.NEXT_PUBLIC_CAMERA_HEIGHT || '480'),
  FACING_MODE: 'user' as const, // Front-facing camera
  FPS: 30,
} as const

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURES = {
  HAND_TRACKING: process.env.NEXT_PUBLIC_FEATURE_HAND_TRACKING !== 'false',
  VOICE_CONTROL: process.env.NEXT_PUBLIC_FEATURE_VOICE_CONTROL !== 'false',
  RECORDING: process.env.NEXT_PUBLIC_FEATURE_RECORDING !== 'false',
  LOOP_STACKING: process.env.NEXT_PUBLIC_FEATURE_LOOP_STACKING !== 'false',
  INSTRUCTIONS_OVERLAY: process.env.NEXT_PUBLIC_FEATURE_INSTRUCTIONS_OVERLAY !== 'false',
  FALLBACK_CONTROLS: process.env.NEXT_PUBLIC_FEATURE_FALLBACK_CONTROLS !== 'false',
  VISUAL_FEEDBACK: process.env.NEXT_PUBLIC_FEATURE_VISUAL_FEEDBACK !== 'false',
  STEM_CONTROL: process.env.NEXT_PUBLIC_FEATURE_STEM_CONTROL === 'true',
  PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_FEATURE_PERFORMANCE_MONITORING !== 'false',
  DEBUG_MODE: process.env.NEXT_PUBLIC_FEATURE_DEBUG_MODE !== 'false',
  
  // Kit availability
  KITS: {
    DRUMS: process.env.NEXT_PUBLIC_FEATURE_DRUM_KIT !== 'false',
    PIANO: process.env.NEXT_PUBLIC_FEATURE_PIANO_KIT !== 'false',
    FUNK: process.env.NEXT_PUBLIC_FEATURE_FUNK_KIT !== 'false',
  },
} as const

// =============================================================================
// DEBUG & DEVELOPMENT
// =============================================================================

export const DEBUG = {
  SHOW_HAND_LANDMARKS: process.env.NEXT_PUBLIC_SHOW_HAND_LANDMARKS === 'true',
  SHOW_FPS_COUNTER: process.env.NEXT_PUBLIC_SHOW_FPS_COUNTER === 'true',
  CONSOLE_LOGGING: process.env.NEXT_PUBLIC_CONSOLE_LOGGING !== 'false',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const

// =============================================================================
// Z-INDEX LAYERS
// =============================================================================

export const Z_INDEX = {
  BASE: 0,
  GRID: 1,
  CONTROLS: 10,
  OVERLAY: 50,
  MODAL: 100,
  TOOLTIP: 200,
  DEBUG: 999,
} as const

// =============================================================================
// ANIMATION DURATIONS (milliseconds)
// =============================================================================

export const ANIMATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  VERY_SLOW: 500,
  
  // Specific animations
  PAD_TRIGGER: 200,
  FADE_IN: 300,
  SLIDE: 300,
  GLOW: 2000,
} as const

// =============================================================================
// BREAKPOINTS (for responsive design)
// =============================================================================

export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
  '3XL': 1920,
} as const

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
  AUDIO: {
    INITIALIZATION_FAILED: 'AUDIO_INIT_FAILED',
    SAMPLE_LOAD_FAILED: 'AUDIO_SAMPLE_LOAD_FAILED',
    PLAYBACK_FAILED: 'AUDIO_PLAYBACK_FAILED',
    CONTEXT_SUSPENDED: 'AUDIO_CONTEXT_SUSPENDED',
  },
  MEDIAPIPE: {
    INITIALIZATION_FAILED: 'MEDIAPIPE_INIT_FAILED',
    CAMERA_ACCESS_DENIED: 'CAMERA_ACCESS_DENIED',
    HAND_DETECTION_FAILED: 'HAND_DETECTION_FAILED',
  },
  VOICE: {
    INITIALIZATION_FAILED: 'VOICE_INIT_FAILED',
    MICROPHONE_ACCESS_DENIED: 'MICROPHONE_ACCESS_DENIED',
    RECOGNITION_FAILED: 'VOICE_RECOGNITION_FAILED',
    NOT_SUPPORTED: 'VOICE_NOT_SUPPORTED',
  },
  RECORDING: {
    START_FAILED: 'RECORDING_START_FAILED',
    STOP_FAILED: 'RECORDING_STOP_FAILED',
    PLAYBACK_FAILED: 'RECORDING_PLAYBACK_FAILED',
  },
} as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true
}

/**
 * Get kit metadata by type
 */
export function getKitMetadata(kit: KitType) {
  return KITS.METADATA[kit]
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Check if running in development mode
 */
export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Check if running in production mode
 */
export const IS_PROD = process.env.NODE_ENV === 'production'

/**
 * Check if running in browser
 */
export const IS_BROWSER = typeof window !== 'undefined'

/**
 * Check if running on mobile device
 */
export const IS_MOBILE = IS_BROWSER && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

/**
 * Application version
 */
export const APP_VERSION = '0.1.0'

/**
 * Application name
 */
export const APP_NAME = 'AirPad MVP'



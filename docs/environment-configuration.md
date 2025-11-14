# Environment Configuration Guide

## Overview

AirPad MVP uses environment variables for configuration. This allows different settings for development, testing, and production environments.

## Files

- **`.env.local`** - Local development configuration (not committed to Git)
- **`.env.example`** - Template for environment variables (committed to Git)

## Configuration Categories

### 1. Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Node environment mode |
| `NEXT_PUBLIC_APP_ENV` | `development` | Application environment |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Application base URL |

### 2. MediaPipe Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_MEDIAPIPE_CDN` | `https://cdn.jsdelivr.net/npm/@mediapipe/hands` | CDN URL for MediaPipe models |
| `NEXT_PUBLIC_MEDIAPIPE_HANDS_VERSION` | `0.4` | MediaPipe Hands version |
| `NEXT_PUBLIC_MEDIAPIPE_MODEL_COMPLEXITY` | `0` | Model complexity (0=lite, 1=full) |
| `NEXT_PUBLIC_MEDIAPIPE_MAX_HANDS` | `1` | Maximum hands to track |
| `NEXT_PUBLIC_MEDIAPIPE_MIN_DETECTION_CONFIDENCE` | `0.5` | Minimum detection confidence |
| `NEXT_PUBLIC_MEDIAPIPE_MIN_TRACKING_CONFIDENCE` | `0.5` | Minimum tracking confidence |

### 3. Audio Engine Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_AUDIO_SAMPLES_PATH` | `/Kits` | Path to audio sample files |
| `NEXT_PUBLIC_DEFAULT_BPM` | `120` | Default beats per minute |
| `NEXT_PUBLIC_DEFAULT_KIT` | `drums` | Default sound kit |
| `NEXT_PUBLIC_MASTER_VOLUME` | `0.8` | Master volume (0-1) |
| `NEXT_PUBLIC_AUDIO_LATENCY_HINT` | `interactive` | Audio latency optimization |
| `NEXT_PUBLIC_AUDIO_LOOKAHEAD` | `0.1` | Transport lookahead time (seconds) |
| `NEXT_PUBLIC_AUDIO_UPDATE_INTERVAL` | `0.05` | Transport update interval (seconds) |

### 4. Gesture Control Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_PINCH_THRESHOLD` | `0.04` | Distance threshold for pinch detection |
| `NEXT_PUBLIC_GESTURE_COOLDOWN_MS` | `220` | Cooldown between gestures (ms) |
| `NEXT_PUBLIC_GRID_LEFT` | `0.3` | Grid left boundary (0-1) |
| `NEXT_PUBLIC_GRID_RIGHT` | `0.7` | Grid right boundary (0-1) |
| `NEXT_PUBLIC_GRID_TOP` | `0.2` | Grid top boundary (0-1) |
| `NEXT_PUBLIC_GRID_BOTTOM` | `0.6` | Grid bottom boundary (0-1) |

### 5. Voice Control Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_VOICE_LANGUAGE` | `en-US` | Speech recognition language |
| `NEXT_PUBLIC_VOICE_CONTINUOUS` | `true` | Continuous recognition |
| `NEXT_PUBLIC_VOICE_INTERIM_RESULTS` | `false` | Return interim results |
| `NEXT_PUBLIC_TTS_RATE` | `1.2` | Text-to-speech rate |
| `NEXT_PUBLIC_TTS_PITCH` | `1.0` | Text-to-speech pitch |
| `NEXT_PUBLIC_TTS_VOLUME` | `0.8` | Text-to-speech volume |

### 6. Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_FEATURE_HAND_TRACKING` | `true` | Enable hand tracking |
| `NEXT_PUBLIC_FEATURE_VOICE_CONTROL` | `true` | Enable voice commands |
| `NEXT_PUBLIC_FEATURE_RECORDING` | `true` | Enable loop recording |
| `NEXT_PUBLIC_FEATURE_LOOP_STACKING` | `true` | Enable loop stacking |
| `NEXT_PUBLIC_FEATURE_INSTRUCTIONS_OVERLAY` | `true` | Enable help overlay |
| `NEXT_PUBLIC_FEATURE_FALLBACK_CONTROLS` | `true` | Enable on-screen buttons |
| `NEXT_PUBLIC_FEATURE_VISUAL_FEEDBACK` | `true` | Enable visual feedback |
| `NEXT_PUBLIC_FEATURE_STEM_CONTROL` | `false` | Enable stem control (beta) |
| `NEXT_PUBLIC_FEATURE_PERFORMANCE_MONITORING` | `true` | Enable performance monitoring |
| `NEXT_PUBLIC_FEATURE_DEBUG_MODE` | `true` | Enable debug mode |
| `NEXT_PUBLIC_FEATURE_DRUM_KIT` | `true` | Enable drum kit |
| `NEXT_PUBLIC_FEATURE_PIANO_KIT` | `true` | Enable piano kit |
| `NEXT_PUBLIC_FEATURE_SYNTH_KIT` | `true` | Enable synth kit |

### 7. Performance Monitoring

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_TARGET_FPS` | `30` | Target frame rate |
| `NEXT_PUBLIC_MAX_AUDIO_LATENCY_MS` | `50` | Maximum acceptable audio latency |
| `NEXT_PUBLIC_MAX_GESTURE_LATENCY_MS` | `100` | Maximum acceptable gesture latency |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | Enable analytics tracking |

### 8. Development Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SHOW_HAND_LANDMARKS` | `false` | Show hand landmark overlay |
| `NEXT_PUBLIC_SHOW_FPS_COUNTER` | `true` | Show FPS counter |
| `NEXT_PUBLIC_CONSOLE_LOGGING` | `true` | Enable console logging |
| `NEXT_PUBLIC_CAMERA_WIDTH` | `640` | Camera resolution width |
| `NEXT_PUBLIC_CAMERA_HEIGHT` | `480` | Camera resolution height |

## Usage in Code

### Accessing Environment Variables

```typescript
// In client-side code (must start with NEXT_PUBLIC_)
const mediapipeCdn = process.env.NEXT_PUBLIC_MEDIAPIPE_CDN

// In server-side code (can be any name)
const nodeEnv = process.env.NODE_ENV
```

### Type-Safe Environment Variables

Create a helper file for type-safe access:

```typescript
// lib/config/env.ts
export const env = {
  mediapipe: {
    cdn: process.env.NEXT_PUBLIC_MEDIAPIPE_CDN || 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelComplexity: parseInt(process.env.NEXT_PUBLIC_MEDIAPIPE_MODEL_COMPLEXITY || '0'),
    maxHands: parseInt(process.env.NEXT_PUBLIC_MEDIAPIPE_MAX_HANDS || '1'),
  },
  audio: {
    defaultBpm: parseInt(process.env.NEXT_PUBLIC_DEFAULT_BPM || '120'),
    defaultKit: process.env.NEXT_PUBLIC_DEFAULT_KIT as 'drums' | 'piano' | 'synth',
  },
  features: {
    handTracking: process.env.NEXT_PUBLIC_FEATURE_HAND_TRACKING === 'true',
    voiceControl: process.env.NEXT_PUBLIC_FEATURE_VOICE_CONTROL === 'true',
  }
} as const
```

## Setup Instructions

1. **For New Developers:**
   ```bash
   cp .env.example .env.local
   ```

2. **Verify Configuration:**
   ```bash
   npm run dev
   # Check browser console for any environment-related warnings
   ```

3. **Production Deployment:**
   - Set `NODE_ENV=production`
   - Set `NEXT_PUBLIC_APP_ENV=production`
   - Update `NEXT_PUBLIC_APP_URL` to production domain
   - Disable debug features:
     - `NEXT_PUBLIC_FEATURE_DEBUG_MODE=false`
     - `NEXT_PUBLIC_SHOW_FPS_COUNTER=false`
     - `NEXT_PUBLIC_CONSOLE_LOGGING=false`

## Security Notes

- ⚠️ **Never commit `.env.local`** to version control
- ✅ All client-side variables must start with `NEXT_PUBLIC_`
- ⚠️ Don't store secrets in `NEXT_PUBLIC_` variables (they're exposed to browser)
- ✅ Keep `.env.example` updated when adding new variables

## Troubleshooting

### Environment Variables Not Loading

1. **Restart dev server** - Next.js loads env vars at startup
2. **Check variable name** - Must start with `NEXT_PUBLIC_` for client-side
3. **Clear Next.js cache** - Delete `.next` folder and rebuild

### MediaPipe CDN Issues

If MediaPipe fails to load:
- Verify CDN URL is accessible
- Check browser console for CORS errors
- Try alternative CDN: `https://unpkg.com/@mediapipe/hands@0.4`

### Performance Issues

Adjust these variables to optimize:
- `NEXT_PUBLIC_MEDIAPIPE_MODEL_COMPLEXITY=0` (lighter model)
- `NEXT_PUBLIC_CAMERA_WIDTH=320` (lower resolution)
- `NEXT_PUBLIC_CAMERA_HEIGHT=240` (lower resolution)

## Next Steps

After configuration:
1. Implement constants file (`lib/constants.ts`) that reads these env vars
2. Create feature flag system (`lib/config/FeatureFlags.ts`)
3. Add environment validation on startup










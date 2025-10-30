# Constants Guide

This document describes all application constants defined in `lib/constants.ts`.

## Overview

The constants file provides:
- **Centralized Configuration**: Single source of truth for app settings
- **Environment Variable Integration**: Reads from `.env.local`
- **Type Safety**: TypeScript constants with proper typing
- **Easy Maintenance**: Change once, update everywhere

## Usage

```typescript
import { AUDIO, GESTURE, FEATURES } from '@/lib/constants'

// Use constants instead of magic numbers
const volume = AUDIO.VOLUME.DEFAULT  // 0.8
const cooldown = GESTURE.PINCH.COOLDOWN_MS  // 220

// Check feature flags
if (FEATURES.HAND_TRACKING) {
  // Initialize hand tracking
}
```

## Categories

### 1. Audio Engine Constants

```typescript
import { AUDIO } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `AUDIO.BPM.MIN` | 60 | Minimum BPM |
| `AUDIO.BPM.MAX` | 200 | Maximum BPM |
| `AUDIO.BPM.DEFAULT` | 120 | Default BPM (from env) |
| `AUDIO.VOLUME.DEFAULT` | 0.8 | Default master volume |
| `AUDIO.LATENCY.HINT` | 'interactive' | Audio context latency hint |
| `AUDIO.LATENCY.LOOKAHEAD` | 0.1 | Lookahead time in seconds |
| `AUDIO.SAMPLES.BASE_PATH` | '/Kits' | Path to audio samples |

**Audio Effects:**
- Limiter: -6dB threshold
- Compressor: -24dB threshold, ratio 3:1
- Reverb: 1.5s decay
- Delay: 1/8 note (0.125s), 0.2 feedback

**Example:**
```typescript
import { AUDIO } from '@/lib/constants'

// Set BPM with validation
const setBPM = (bpm: number) => {
  const clamped = clamp(bpm, AUDIO.BPM.MIN, AUDIO.BPM.MAX)
  audioEngine.setBPM(clamped)
}
```

### 2. Gesture Control Constants

```typescript
import { GESTURE } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `GESTURE.PINCH.THRESHOLD` | 0.04 | Distance threshold for pinch |
| `GESTURE.PINCH.COOLDOWN_MS` | 220 | Cooldown between pinches |
| `GESTURE.GRID.LEFT` | 0.3 | Left boundary (normalized) |
| `GESTURE.GRID.RIGHT` | 0.7 | Right boundary (normalized) |
| `GESTURE.GRID.TOP` | 0.2 | Top boundary (normalized) |
| `GESTURE.GRID.BOTTOM` | 0.6 | Bottom boundary (normalized) |

**MediaPipe Landmarks:**
```typescript
GESTURE.LANDMARKS.THUMB_TIP         // 4
GESTURE.LANDMARKS.INDEX_FINGER_TIP  // 8
GESTURE.LANDMARKS.MIDDLE_FINGER_TIP // 12
```

**Example:**
```typescript
import { GESTURE } from '@/lib/constants'

const isPinching = distance < GESTURE.PINCH.THRESHOLD

if (isPinching && now - lastPinch > GESTURE.PINCH.COOLDOWN_MS) {
  triggerPad()
}
```

### 3. MediaPipe Configuration

```typescript
import { MEDIAPIPE } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `MEDIAPIPE.CDN` | CDN URL | MediaPipe library URL |
| `MEDIAPIPE.HANDS.MAX_NUM_HANDS` | 1 | Track one hand |
| `MEDIAPIPE.HANDS.MODEL_COMPLEXITY` | 0 | Lite model |
| `MEDIAPIPE.HANDS.MIN_DETECTION_CONFIDENCE` | 0.5 | Detection confidence |
| `MEDIAPIPE.HANDS.MIN_TRACKING_CONFIDENCE` | 0.5 | Tracking confidence |

**Example:**
```typescript
import { MEDIAPIPE } from '@/lib/constants'

const hands = new Hands({
  locateFile: (file) => `${MEDIAPIPE.CDN}/${file}`
})

hands.setOptions({
  maxNumHands: MEDIAPIPE.HANDS.MAX_NUM_HANDS,
  modelComplexity: MEDIAPIPE.HANDS.MODEL_COMPLEXITY,
  // ...
})
```

### 4. Voice Control Constants

```typescript
import { VOICE } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `VOICE.LANGUAGE` | 'en-US' | Speech recognition language |
| `VOICE.CONTINUOUS` | true | Continuous recognition |
| `VOICE.TTS.RATE` | 1.2 | Speech synthesis rate |
| `VOICE.TTS.VOLUME` | 0.8 | Speech synthesis volume |

### 5. Grid & UI Layout

```typescript
import { GRID } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `GRID.ROWS` | 3 | Grid rows |
| `GRID.COLS` | 3 | Grid columns |
| `GRID.TOTAL_PADS` | 9 | Total pads |
| `GRID.PAD.SIZE` | 120 | Pad size in pixels |
| `GRID.PAD.GAP` | 16 | Gap between pads |
| `GRID.PAD.BORDER_RADIUS` | 12 | Pad border radius |

**Example:**
```typescript
import { GRID } from '@/lib/constants'

const padGrid = Array.from({ length: GRID.TOTAL_PADS }, (_, i) => ({
  id: i,
  row: Math.floor(i / GRID.COLS),
  col: i % GRID.COLS,
}))
```

### 6. Kit Types

```typescript
import { KITS, type KitType } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `KITS.TYPES` | ['drums', 'piano', 'synth'] | Available kits |
| `KITS.DEFAULT` | 'drums' | Default kit |

**Kit Metadata:**
```typescript
KITS.METADATA.drums   // { name: 'Drum Kit', color: '#EC4899', icon: '🥁' }
KITS.METADATA.piano   // { name: 'Piano', color: '#8B5CF6', icon: '🎹' }
KITS.METADATA.synth   // { name: 'Synth', color: '#06B6D4', icon: '🎛️' }
```

**Example:**
```typescript
import { KITS, getKitMetadata } from '@/lib/constants'

const currentKit: KitType = 'drums'
const metadata = getKitMetadata(currentKit)

console.log(metadata.name)  // 'Drum Kit'
console.log(metadata.color) // '#EC4899'
```

### 7. Recording & Loop Constants

```typescript
import { RECORDING } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `RECORDING.MIN_LOOP_LENGTH_MS` | 500 | Minimum loop length |
| `RECORDING.MAX_LOOP_LENGTH_MS` | 60000 | Maximum loop length (60s) |
| `RECORDING.MAX_LOOP_LAYERS` | 10 | Maximum loop layers |
| `RECORDING.TIMING_PRECISION` | 1 | Timing precision in ms |

### 8. Performance Monitoring

```typescript
import { PERFORMANCE } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `PERFORMANCE.TARGET_FPS` | 30 | Target frame rate |
| `PERFORMANCE.THRESHOLDS.FPS_WARNING` | 20 | FPS warning threshold |
| `PERFORMANCE.THRESHOLDS.FPS_CRITICAL` | 10 | FPS critical threshold |

**Example:**
```typescript
import { PERFORMANCE } from '@/lib/constants'

if (currentFPS < PERFORMANCE.THRESHOLDS.FPS_WARNING) {
  console.warn('Low FPS detected:', currentFPS)
}
```

### 9. Camera Settings

```typescript
import { CAMERA } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `CAMERA.WIDTH` | 640 | Camera width |
| `CAMERA.HEIGHT` | 480 | Camera height |
| `CAMERA.FACING_MODE` | 'user' | Front-facing camera |
| `CAMERA.FPS` | 30 | Camera frame rate |

### 10. Feature Flags

```typescript
import { FEATURES, isFeatureEnabled } from '@/lib/constants'
```

| Feature | Default | Description |
|---------|---------|-------------|
| `FEATURES.HAND_TRACKING` | true | Enable hand tracking |
| `FEATURES.VOICE_CONTROL` | true | Enable voice commands |
| `FEATURES.RECORDING` | true | Enable recording |
| `FEATURES.LOOP_STACKING` | true | Enable loop stacking |
| `FEATURES.DEBUG_MODE` | true (dev) | Enable debug features |

**Example:**
```typescript
import { FEATURES, isFeatureEnabled } from '@/lib/constants'

if (isFeatureEnabled('HAND_TRACKING')) {
  await handTracker.initialize()
}

// Or direct access
if (FEATURES.VOICE_CONTROL) {
  await voiceController.initialize()
}
```

### 11. Debug & Development

```typescript
import { DEBUG, IS_DEV, IS_PROD } from '@/lib/constants'
```

| Constant | Value | Description |
|----------|-------|-------------|
| `DEBUG.SHOW_HAND_LANDMARKS` | false | Show hand landmarks |
| `DEBUG.SHOW_FPS_COUNTER` | true | Show FPS counter |
| `DEBUG.CONSOLE_LOGGING` | true | Enable console logs |
| `IS_DEV` | boolean | Running in development |
| `IS_PROD` | boolean | Running in production |
| `IS_BROWSER` | boolean | Running in browser |
| `IS_MOBILE` | boolean | Running on mobile |

**Example:**
```typescript
import { IS_DEV, DEBUG } from '@/lib/constants'

if (IS_DEV && DEBUG.CONSOLE_LOGGING) {
  console.log('Debug info:', data)
}
```

### 12. Z-Index Layers

```typescript
import { Z_INDEX } from '@/lib/constants'
```

| Constant | Value | Usage |
|----------|-------|-------|
| `Z_INDEX.BASE` | 0 | Base layer |
| `Z_INDEX.GRID` | 1 | Pad grid |
| `Z_INDEX.CONTROLS` | 10 | Control panels |
| `Z_INDEX.OVERLAY` | 50 | Overlays |
| `Z_INDEX.MODAL` | 100 | Modals |
| `Z_INDEX.TOOLTIP` | 200 | Tooltips |
| `Z_INDEX.DEBUG` | 999 | Debug UI |

**Example:**
```tsx
<div style={{ zIndex: Z_INDEX.OVERLAY }}>
  <InstructionsOverlay />
</div>
```

### 13. Animation Durations

```typescript
import { ANIMATION } from '@/lib/constants'
```

| Constant | Value (ms) | Usage |
|----------|-----------|-------|
| `ANIMATION.FAST` | 150 | Quick transitions |
| `ANIMATION.NORMAL` | 250 | Standard transitions |
| `ANIMATION.SLOW` | 350 | Slow transitions |
| `ANIMATION.PAD_TRIGGER` | 200 | Pad trigger animation |
| `ANIMATION.FADE_IN` | 300 | Fade in duration |

**Example:**
```tsx
<div className="transition-all" style={{ transitionDuration: `${ANIMATION.NORMAL}ms` }}>
  {content}
</div>
```

### 14. Breakpoints

```typescript
import { BREAKPOINTS } from '@/lib/constants'
```

| Constant | Value (px) | Description |
|----------|-----------|-------------|
| `BREAKPOINTS.XS` | 480 | Extra small devices |
| `BREAKPOINTS.SM` | 640 | Small devices |
| `BREAKPOINTS.MD` | 768 | Medium devices |
| `BREAKPOINTS.LG` | 1024 | Large devices |
| `BREAKPOINTS.XL` | 1280 | Extra large |
| `BREAKPOINTS['3XL']` | 1920 | Ultra-wide |

### 15. Error Codes

```typescript
import { ERROR_CODES } from '@/lib/constants'
```

**Audio Errors:**
```typescript
ERROR_CODES.AUDIO.INITIALIZATION_FAILED
ERROR_CODES.AUDIO.SAMPLE_LOAD_FAILED
ERROR_CODES.AUDIO.PLAYBACK_FAILED
ERROR_CODES.AUDIO.CONTEXT_SUSPENDED
```

**MediaPipe Errors:**
```typescript
ERROR_CODES.MEDIAPIPE.INITIALIZATION_FAILED
ERROR_CODES.MEDIAPIPE.CAMERA_ACCESS_DENIED
ERROR_CODES.MEDIAPIPE.HAND_DETECTION_FAILED
```

**Voice Errors:**
```typescript
ERROR_CODES.VOICE.INITIALIZATION_FAILED
ERROR_CODES.VOICE.MICROPHONE_ACCESS_DENIED
ERROR_CODES.VOICE.NOT_SUPPORTED
```

**Example:**
```typescript
import { ERROR_CODES } from '@/lib/constants'

try {
  await audioEngine.initialize()
} catch (error) {
  throw new Error(ERROR_CODES.AUDIO.INITIALIZATION_FAILED)
}
```

## Helper Functions

### `isFeatureEnabled(feature)`
Check if a feature flag is enabled.

```typescript
if (isFeatureEnabled('RECORDING')) {
  startRecording()
}
```

### `getKitMetadata(kit)`
Get metadata for a kit type.

```typescript
const metadata = getKitMetadata('drums')
console.log(metadata.name)  // 'Drum Kit'
```

### `clamp(value, min, max)`
Clamp a value between min and max.

```typescript
const volume = clamp(userInput, AUDIO.VOLUME.MIN, AUDIO.VOLUME.MAX)
```

## Environment Variable Override

All constants that read from environment variables can be overridden in `.env.local`:

```bash
# Override default BPM
NEXT_PUBLIC_DEFAULT_BPM=140

# Override pinch threshold
NEXT_PUBLIC_PINCH_THRESHOLD=0.05

# Disable feature
NEXT_PUBLIC_FEATURE_DEBUG_MODE=false
```

## Best Practices

1. **Always use constants instead of magic numbers**
   ```typescript
   // ❌ Bad
   if (distance < 0.04) { }
   
   // ✅ Good
   if (distance < GESTURE.PINCH.THRESHOLD) { }
   ```

2. **Use type-safe imports**
   ```typescript
   import type { KitType } from '@/lib/constants'
   const kit: KitType = 'drums'  // Type-safe!
   ```

3. **Check feature flags before using features**
   ```typescript
   if (FEATURES.VOICE_CONTROL) {
     // Only initialize if feature is enabled
   }
   ```

4. **Use helper functions**
   ```typescript
   // ✅ Good
   const bpm = clamp(input, AUDIO.BPM.MIN, AUDIO.BPM.MAX)
   
   // ❌ Bad
   const bpm = Math.min(Math.max(input, 60), 200)
   ```

## Adding New Constants

1. Add to appropriate section in `lib/constants.ts`
2. Update this documentation
3. Consider adding environment variable support
4. Export types if needed

## TypeScript Integration

All constants are `as const` for maximum type safety:

```typescript
const kit: typeof KITS.TYPES[number] = 'drums'  // Only 'drums' | 'piano' | 'synth'
```

This prevents typos and enables IDE autocomplete!



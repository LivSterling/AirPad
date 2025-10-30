# Audio Engine Architecture

**Task:** 3.11 - Document audio engine architecture and configuration options  
**Status:** Complete  
**Last Updated:** 2025-10-30

---

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [System Architecture](#system-architecture)
4. [Configuration Options](#configuration-options)
5. [Audio Processing Pipeline](#audio-processing-pipeline)
6. [Sample Loading](#sample-loading)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Mobile Support](#mobile-support)
10. [Health Monitoring](#health-monitoring)

---

## Overview

The AirPad audio engine is built on **Tone.js**, a powerful Web Audio API framework that handles all audio synthesis, sample playback, and effect processing. The system is designed for **low latency** (~20-50ms), **cross-browser compatibility**, and **graceful degradation** on resource-constrained devices.

### Key Principles

- **Latency First:** Optimized for interactive performance
- **Progressive Enhancement:** Works with or without advanced features
- **Event-Driven:** All audio events flow through EventBus for decoupled communication
- **Error Recovery:** Automatic fallback strategies for failures
- **Mobile-Ready:** Special handling for iOS/Android audio context requirements

---

## Core Components

### 1. AudioEngine (`lib/audio/AudioEngine.ts`)

**Responsibility:** Core audio synthesis, sample playback, and effect management

**Key Features:**
- Tone.js Transport management (BPM, time signatures)
- Master volume control
- Effect chain (Compressor → Reverb → Delay)
- Kit switching and sample triggering
- Loop recording and playback

**Public API:**

```typescript
// Initialize audio context
await AudioEngine.initialize()

// Control playback
AudioEngine.play(sampleName: string, velocity: number, time?: Time)
AudioEngine.stop(sampleName: string, time?: Time)

// Kit management
AudioEngine.switchKit(kitName: 'drums' | 'piano' | 'synth')
AudioEngine.setVolume(volume: number) // 0-1

// Recording
AudioEngine.startRecording()
AudioEngine.stopRecording(): AudioBuffer
AudioEngine.clearRecording()

// Loop playback
AudioEngine.playLoop(loopData: LoopData, velocity?: number)
AudioEngine.stopAllLoops()

// Cleanup
AudioEngine.dispose()
```

### 2. AudioOptimizer (`lib/audio/AudioOptimizer.ts`)

**Responsibility:** Latency optimization, mobile support, and health monitoring

**Key Features:**
- Transport lookahead tuning
- Mobile audio context resume
- Real-time health metrics
- Buffer underrun detection

**Public API:**

```typescript
// Latency optimization
AudioOptimizer.optimizeTransport()

// Mobile support
AudioOptimizer.setupMobileAudioContext()

// Health monitoring
AudioOptimizer.startHealthChecks(intervalMs?: number)
AudioOptimizer.getHealthMetrics(): AudioHealthMetrics

// Context validation
AudioOptimizer.validateAudioContext(): boolean

// Kit switching
await AudioOptimizer.prepareKitSwitch()
await AudioOptimizer.completeKitSwitch()
```

### 3. ProgressiveSampleLoader (`lib/audio/ProgressiveSampleLoader.ts`)

**Responsibility:** Efficient sample loading with preload and lazy-load strategies

**Key Features:**
- Preload critical kit samples (drums) on startup
- Lazy-load other kits on demand
- Load progress tracking
- Automatic timeout handling

**Public API:**

```typescript
// Startup preloading
await ProgressiveSampleLoader.preloadCriticalKit('drums', samples)

// On-demand loading
await ProgressiveSampleLoader.lazyLoadKit('piano', samples)

// Progress tracking
ProgressiveSampleLoader.getProgress(): SampleLoadProgress

// Caching
ProgressiveSampleLoader.getSample(kitName, sampleName)
ProgressiveSampleLoader.isPreloaded(kitName): boolean

// Cleanup
ProgressiveSampleLoader.clear()
```

### 4. AudioStoreConnector (`lib/integration/AudioStoreConnector.ts`)

**Responsibility:** Bridge between AudioEngine and Zustand store

**Key Features:**
- Two-way data sync
- Store change → Audio action routing
- Audio event → Store update handling
- Error recovery coordination

**Data Flow:**

```
Store Action
    ↓
AudioStoreConnector.handleStoreChange()
    ↓
AudioEngine API Call
    ↓
Audio Event (EventBus)
    ↓
AudioStoreConnector.handleAudioEvent()
    ↓
Store Update
```

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         UI Layer (React Components)         │
├─────────────────────────────────────────────┤
│     AudioStoreConnector (Integration)       │
├─────────────────────────────────────────────┤
│  Zustand Store (State Management)           │
├─────────────────────────────────────────────┤
│  AudioEngine | AudioOptimizer | Loader     │
│      (Audio Processing & Effects)           │
├─────────────────────────────────────────────┤
│      Tone.js (Web Audio API Framework)      │
├─────────────────────────────────────────────┤
│  Web Audio API (OS Level Audio System)      │
└─────────────────────────────────────────────┘
```

### Communication Flow

```
┌──────────────┐
│ UI Component │
└──────────────┘
      │
      │ setState(padTriggered: true)
      ↓
┌──────────────────────┐
│ Zustand Store        │
└──────────────────────┘
      │
      │ emit(store:change)
      ↓
┌──────────────────────────┐
│ AudioStoreConnector      │
│ - handleStoreChange()    │
└──────────────────────────┘
      │
      │ AudioEngine.play(sample, velocity)
      ↓
┌──────────────────────────┐
│ AudioEngine              │
│ - Trigger sampler        │
│ - Apply effects          │
└──────────────────────────┘
      │
      │ emit(audio:played)
      ↓
┌──────────────────────────┐
│ EventBus                 │
│ Broadcast to all systems │
└──────────────────────────┘
```

---

## Configuration Options

### Tone.js Transport Configuration

Configured in `AudioOptimizer.optimizeTransport()`:

```typescript
// Lookahead time (seconds)
// Lower = less latency but more CPU; Higher = more stable but higher latency
Tone.Transport.lookahead = AUDIO.LATENCY.LOOKAHEAD (default: 0.1)

// Update interval for scheduling (seconds)
// Controls when Tone.js checks the Transport for events
Tone.Transport.updateInterval = AUDIO.LATENCY.UPDATE_INTERVAL (default: 0.016)

// Latency hint ('interactive', 'balanced', 'playback')
// 'interactive' = lowest latency (~20ms)
AUDIO.LATENCY.HINT = 'interactive'

// Maximum acceptable latency (milliseconds)
AUDIO.LATENCY.MAX_ACCEPTABLE_MS = 50
```

### Sample Loading Configuration

Configured in `lib/constants.ts`:

```typescript
AUDIO.SAMPLE_LOADING = {
  PRELOAD_KIT: 'drums',        // Kit to preload on startup
  PRELOAD_TIMEOUT: 30000,       // Timeout for preload (ms)
  LAZY_LOAD_TIMEOUT: 10000,     // Timeout for lazy load (ms)
  PROGRESS_UPDATE_INTERVAL: 100, // Emit progress every Xms
}
```

### Effect Chain Configuration

```typescript
AUDIO.EFFECTS = {
  COMPRESSOR: {
    threshold: -24,    // dB
    ratio: 4,          // Compression ratio
    attack: 0.003,     // seconds
    release: 0.25,     // seconds
  },
  REVERB: {
    decay: 2.5,        // seconds
    wet: 0.2,          // 0-1 (mix amount)
  },
  DELAY: {
    time: '8n',        // Eighth note
    feedback: 0.3,     // 0-1 (feedback amount)
    wet: 0.1,          // 0-1 (mix amount)
  },
}
```

### Kit Configuration

Location: `lib/utils/helpers.ts` → `getKitConfig()`

```typescript
const configs = {
  drums: {
    // Maps sample names to file paths
    samples: {
      '0': '/Kits/drums/kick-drum-105.wav',
      '1': '/Kits/drums/snare-tight-76.wav',
      // ... more samples
    },
  },
  piano: { ... },
  synth: { ... },
}
```

---

## Audio Processing Pipeline

### Signal Flow per Trigger

```
1. User Input (hand gesture, voice command, or UI click)
   ↓
2. Store update (setPadTriggered, setVelocity)
   ↓
3. AudioStoreConnector.handleStoreChange()
   ↓
4. AudioEngine.play(sampleName, velocity)
   ↓
5. Sampler starts playback
   ↓
6. Signal → Compressor (dynamic range)
   ↓
7. Signal → Reverb (space/ambience)
   ↓
8. Signal → Delay (echo)
   ↓
9. Signal → Master Volume
   ↓
10. Signal → Web Audio API (speakers)
    ↓
11. EventBus emit('audio:played', metadata)
```

### Velocity Mapping

Velocity values (0-1) control multiple parameters:

```typescript
export function mapVelocity(velocity: number) {
  return {
    gain: 0.1 + velocity * 0.8,      // 0.1 to 0.9
    compressorThreshold: -24 + velocity * 12, // -24 to -12 dB
    resonance: 0.3 + velocity * 0.4, // 0.3 to 0.7 (for synth)
  }
}
```

---

## Sample Loading

### Preload Strategy (Startup)

```typescript
// 1. App initializes
// 2. InitializationSequence runs
// 3. AudioEngine.initialize() called
// 4. ProgressiveSampleLoader.preloadCriticalKit('drums')
//    - Loads 8 drum samples sequentially
//    - Emits progress events every sample
//    - Completes ~2-3 seconds
// 5. App ready for user interaction
```

**Timeline:**
- 0-500ms: App boots
- 500-3000ms: Drums preload
- 3000+ms: User can interact
- On-demand: Other kits lazy-load when selected

### Lazy-Load Strategy (Runtime)

```typescript
// 1. User selects 'piano' kit
// 2. Store triggers kit change
// 3. AudioStoreConnector detects change
// 4. ProgressiveSampleLoader.lazyLoadKit('piano') queued
// 5. Old kit fades out (PrepareKitSwitch)
// 6. Piano samples load in background
// 7. Kit switches when ready
// 8. Old kit disposed, memory freed
```

---

## Performance Optimization

### Latency Reduction Techniques

1. **Lookahead Tuning**
   - Lower lookahead = less scheduling overhead but higher timing jitter
   - Optimal value: 0.05-0.1s for interactive use

2. **Update Interval**
   - Matches display refresh rate (~60Hz = 0.016s)
   - More frequent checks = higher CPU but better timing

3. **Sample Preloading**
   - Eliminates disk I/O latency during playback
   - Drums preloaded at startup

4. **Effect Bypass in Low-Latency Mode**
   - Reverb/Delay optional
   - Compressor always on for safety

### CPU Usage Optimization

```typescript
// Monitor CPU usage
const metrics = AudioOptimizer.getHealthMetrics()
console.log(`CPU Usage: ${metrics.cpuUsage}%`)

// If CPU > 80%, consider:
// - Disabling Reverb/Delay
// - Reducing sample polyphony
// - Increasing lookahead time
```

### Memory Management

```typescript
// Samples remain cached after load
ProgressiveSampleLoader.getStats()
// {
//   totalKits: 3,
//   totalSamples: 24,
//   preloadedKits: ['drums'],
//   loadingKits: []
// }

// Clear unused kits
ProgressiveSampleLoader.clear()
```

---

## Error Handling

### Error Categories

| Category | Codes | Recovery |
|----------|-------|----------|
| **Audio Context** | AUDIO_CONTEXT_INVALID | Resume with user gesture |
| **Sample Loading** | SAMPLE_PRELOAD_FAILED | Fallback to default kit |
| **Audio Context Resume** | AUDIO_CONTEXT_RESUME_FAILED | Retry on next gesture |
| **Sample Playback** | AUDIO_PLAYBACK_FAILED | Emit error event |

### Error Flow

```typescript
Try {
  AudioEngine.play(sample, velocity)
} catch (error) {
  // 1. ErrorHandler.logError()
  // 2. EventBus.emit('error:audio', errorData)
  // 3. AudioStoreConnector.attemptRecovery()
  // 4. User notified via UI
}
```

---

## Mobile Support

### iOS Audio Context Requirements

```typescript
// iOS 14.5+: Requires user gesture to start audio
// AudioOptimizer.setupMobileAudioContext() handles:
// 1. Click event → Tone.start()
// 2. Touchstart event → Tone.start()
// 3. Keydown event → Tone.start()
// 4. Monitor context state changes

// Single gesture is sufficient for entire session
```

### Android Audio Context

```typescript
// Android: May suspend context during background
// AudioOptimizer monitors:
// - onstatechange: 'suspended' → resume on gesture
// - onstatechange: 'running' → all good
```

### Testing on Mobile

```javascript
// In DevTools (desktop)
// Or use real device with ngrok/expose

// Test audio context:
console.log(Tone.context.state) // 'suspended' on mobile until gesture

// Trigger manually:
await Tone.start()
```

---

## Health Monitoring

### Health Metrics

```typescript
interface AudioHealthMetrics {
  audioContextState: string        // 'running' | 'suspended' | 'closed'
  audioLatencyMs: number           // Current latency estimate
  cpuUsage: number                 // 0-100%
  bufferUnderruns: number          // Glitch count
  lastCheck: number                // Timestamp
  isHealthy: boolean               // All metrics OK?
}
```

### Real-Time Monitoring

```typescript
// Start checks
AudioOptimizer.startHealthChecks(5000) // Every 5s

// Emits events:
// - audio:healthCheck (always)
// - audio:healthWarning (if issues detected)
// - audio:criticalHealth (if > 10 underruns)
```

### Debugging

```typescript
// Manual check
const health = AudioOptimizer.getHealthMetrics()
console.table(health)

// In UI component
useEffect(() => {
  const handler = (metrics) => {
    if (!metrics.isHealthy) {
      showWarning('Audio system degraded')
    }
  }
  EventBus.on('audio:healthWarning', handler)
  return () => EventBus.off('audio:healthWarning', handler)
}, [])
```

---

## Best Practices

### Initialization Order

```typescript
// 1. App boots → InitializationSequence.execute()
// 2. AudioOptimizer.optimizeTransport()
// 3. AudioOptimizer.setupMobileAudioContext()
// 4. ProgressiveSampleLoader.preloadCriticalKit('drums')
// 5. AudioOptimizer.startHealthChecks()
// 6. Ready for user interaction
```

### Performance Tips

✅ **DO:**
- Preload drums on startup
- Use velocity for dynamic audio
- Monitor health metrics
- Lazy-load other kits
- Dispose unused samples

❌ **DON'T:**
- Load all kits at startup
- Ignore buffer underruns
- Use high lookahead values
- Play overlapping samples unnecessarily
- Disable error handling

### Debugging

```typescript
// Enable verbose logging
localStorage.setItem('DEBUG_AUDIO', 'true')

// Check audio context
console.log(Tone.context)

// Monitor EventBus
EventBus.on('audio:*', console.log)

// Check sample cache
ProgressiveSampleLoader.getStats()
```

---

## Summary

The AirPad audio engine combines **Tone.js power** with **custom optimization layers** to deliver **low-latency, reliable audio** across devices. The **event-driven architecture** ensures clean separation of concerns, while **progressive loading** and **health monitoring** ensure production stability.

**Key Takeaways:**
- Latency-first design (~20-50ms)
- Mobile-ready audio context handling
- Progressive sample loading
- Real-time health monitoring
- Comprehensive error recovery

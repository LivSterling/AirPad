# Loop Sync & Visualization - Design Document

## 🎯 **Problem Statement**

### **Current Issues:**
1. ❌ **Loops Don't Sync:** Recordings start immediately, not aligned to loop boundaries
2. ❌ **No Visual Feedback:** Can't see where you are in the loop or when events trigger
3. ❌ **No Preview:** Have to save loop before hearing it with other loops
4. ❌ **No Timing Reference:** Hard to record in sync without visual or audio cues

### **User Needs:**
- ✅ Record new loops in perfect sync with existing loops
- ✅ See a timeline showing loop position and events
- ✅ Preview new recording before committing to save it
- ✅ Visual countdown before recording starts
- ✅ Know exactly when to play to stay in sync

---

## 🎨 **Proposed Solution**

### **1. Master Loop Timing System**

#### **Concept:**
Establish a fixed loop length that all loops sync to (like a traditional loop station).

#### **Implementation:**
```typescript
interface MasterLoopConfig {
  lengthBars: number        // Default: 4 bars
  beatsPerBar: number       // Default: 4 (4/4 time)
  bpm: number              // Default: 120 BPM
  lengthMs: number         // Calculated: (bars * beats * 60000) / bpm
}

// Example: 4 bars at 120 BPM = 8 seconds
// lengthMs = (4 * 4 * 60000) / 120 = 8000ms
```

#### **Key Rules:**
- First recording establishes master loop length
- All subsequent recordings align to this length
- Recording auto-starts on next loop boundary
- All loops play in perfect sync

---

### **2. Recording Countdown & Sync**

#### **Flow:**
```
User says "record" 
  ↓
Show countdown: "3... 2... 1..."
  ↓
Wait for current loop to restart (if playing)
  ↓
Start recording on loop boundary
  ↓
Record until loop completes
  ↓
Stop recording automatically
  ↓
Enter PREVIEW mode
```

#### **Visual Countdown:**
```tsx
<div className="countdown-overlay">
  <div className="countdown-number">{count}</div>
  <div className="countdown-message">
    Recording starts on next loop...
  </div>
</div>
```

#### **Sync Logic:**
```typescript
async startRecordingSync() {
  if (this.isPlaying && this.masterLoopLength > 0) {
    // Calculate time until next loop boundary
    const currentTime = Tone.Transport.seconds
    const loopPosition = currentTime % this.masterLoopLength
    const timeUntilBoundary = this.masterLoopLength - loopPosition
    
    // Show countdown
    this.showCountdown(timeUntilBoundary)
    
    // Wait for boundary
    await delay(timeUntilBoundary * 1000)
  }
  
  // Start recording at loop boundary
  this.startRecording()
}
```

---

### **3. Loop Timeline Visualization**

#### **Component: LoopTimeline**

```
┌─────────────────────────────────────────────┐
│  🔴 Recording  |  Bar 1  |  Bar 2  |  Bar 3  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ▲ Playhead (moving)                         │
└─────────────────────────────────────────────┘
```

#### **Features:**
- **Playhead:** Moving indicator showing current position
- **Bar Markers:** Visual divisions for musical bars
- **Beat Grid:** Subtle grid lines for each beat
- **Loop Events:** Dots/markers showing when sounds trigger

#### **UI Design:**
```tsx
<div className="loop-timeline">
  {/* Background with bar divisions */}
  <div className="timeline-bars">
    {[1, 2, 3, 4].map(bar => (
      <div key={bar} className="bar-marker">
        <span className="bar-number">Bar {bar}</span>
      </div>
    ))}
  </div>
  
  {/* Playhead */}
  <div 
    className="playhead" 
    style={{ left: `${playheadPosition}%` }}
  />
  
  {/* Event markers */}
  {currentLoop.events.map(event => (
    <div 
      className="event-marker"
      style={{ left: `${(event.timestamp / loopLength) * 100}%` }}
    />
  ))}
</div>
```

---

### **4. Multi-Track Visualization**

#### **Component: LoopTracks**

```
┌─────────────────────────────────────────────┐
│ Loop 1: ●──●────●──●────●──●────●──●────    │
│ Loop 2: ──●────●────────●────────●──────    │
│ Loop 3: ●────────●──●────────────●──●──     │
│ PREVIEW: ●──●──────●────●──●──────●────     │ (unsaved)
└─────────────────────────────────────────────┘
```

#### **Features:**
- **Separate Track per Loop:** Each saved loop on its own lane
- **Event Visualization:** Dots showing when each sound triggers
- **Color Coding:** Different colors for different kits/sounds
- **Preview Track:** Show current recording before saving
- **Mute/Solo:** Toggle individual loops on/off

#### **Implementation:**
```tsx
<div className="loop-tracks">
  {savedLoops.map((loop, index) => (
    <div key={loop.id} className="loop-track">
      <div className="track-header">
        <span>Loop {index + 1}</span>
        <button onClick={() => toggleLoop(loop.id)}>
          {activeLoops.includes(loop.id) ? '🔊' : '🔇'}
        </button>
      </div>
      <div className="track-events">
        {loop.events.map((event, i) => (
          <div 
            key={i}
            className={`event-dot kit-${event.kitType}`}
            style={{ left: `${(event.timestamp / loopLength) * 100}%` }}
          />
        ))}
      </div>
    </div>
  ))}
  
  {/* Preview track (if recording just stopped) */}
  {previewLoop && (
    <div className="loop-track preview-track">
      <div className="track-header">
        <span>PREVIEW (not saved)</span>
      </div>
      <div className="track-events">
        {previewLoop.events.map((event, i) => (
          <div 
            key={i}
            className={`event-dot kit-${event.kitType}`}
            style={{ left: `${(event.timestamp / loopLength) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )}
</div>
```

---

### **5. Preview Mode**

#### **Workflow:**
```
Recording stops
  ↓
Enter PREVIEW mode
  ↓
Play current recording + saved loops together
  ↓
User hears result before saving
  ↓
Show buttons: [✓ Save Loop] [✗ Discard] [↺ Re-record]
```

#### **State Management:**
```typescript
interface LoopState {
  savedLoops: LoopData[]        // Confirmed loops
  previewLoop: LoopData | null  // Current recording being previewed
  isPreviewMode: boolean        // True after recording stops
}

// When recording stops:
function stopRecording() {
  const recordedLoop = captureCurrentLoop()
  
  // Don't save yet - go to preview
  setPreviewLoop(recordedLoop)
  setPreviewMode(true)
  
  // Start playing preview + saved loops
  playPreview()
}

// User confirms save:
function confirmSaveLoop() {
  if (previewLoop) {
    addToSavedLoops(previewLoop)
    setPreviewLoop(null)
    setPreviewMode(false)
  }
}

// User discards:
function discardLoop() {
  setPreviewLoop(null)
  setPreviewMode(false)
  stopPlayback()
}
```

#### **UI During Preview:**
```tsx
{isPreviewMode && (
  <div className="preview-controls">
    <div className="preview-banner">
      🎵 Preview Mode - Hear your loop before saving
    </div>
    <div className="preview-buttons">
      <button onClick={confirmSaveLoop} className="btn-save">
        ✓ Save Loop
      </button>
      <button onClick={discardLoop} className="btn-discard">
        ✗ Discard
      </button>
      <button onClick={reRecord} className="btn-rerecord">
        ↺ Re-record
      </button>
    </div>
  </div>
)}
```

---

### **6. Optional Metronome**

#### **Feature:**
Add a click track to help with timing.

#### **Implementation:**
```typescript
class Metronome {
  private clickSynth: Tone.Synth
  private isEnabled: boolean = false
  
  initialize() {
    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
    }).toDestination()
  }
  
  start(bpm: number) {
    Tone.Transport.bpm.value = bpm
    Tone.Transport.scheduleRepeat((time) => {
      if (this.isEnabled) {
        // Higher pitch on beat 1
        const beat = Tone.Transport.position.split(':')[2]
        const frequency = beat === '0' ? 'C5' : 'C4'
        this.clickSynth.triggerAttackRelease(frequency, '16n', time)
      }
    }, '4n')
  }
  
  toggle() {
    this.isEnabled = !this.isEnabled
  }
}
```

#### **UI Toggle:**
```tsx
<button onClick={toggleMetronome} className="metronome-toggle">
  {metronomeEnabled ? '🔔 Metronome On' : '🔕 Metronome Off'}
</button>
```

---

## 📋 **Implementation Plan**

### **Phase 1: Master Loop Timing (Priority: CRITICAL)**
1. ✅ Establish master loop length system
2. ✅ Sync recording start to loop boundaries
3. ✅ Add countdown visual before recording
4. ✅ Auto-stop recording at loop end

### **Phase 2: Timeline Visualization (Priority: HIGH)**
1. ✅ Create `LoopTimeline` component
2. ✅ Add moving playhead indicator
3. ✅ Show bar markers and beat grid
4. ✅ Display event markers for current loop

### **Phase 3: Preview Mode (Priority: HIGH)**
1. ✅ Implement preview state management
2. ✅ Play preview loop alongside saved loops
3. ✅ Add Save/Discard/Re-record buttons
4. ✅ Only commit to saved loops on user confirmation

### **Phase 4: Multi-Track Visualization (Priority: MEDIUM)**
1. ✅ Create `LoopTracks` component
2. ✅ Show each saved loop as a track
3. ✅ Display event dots for each loop
4. ✅ Add mute/solo controls per track

### **Phase 5: Polish & Features (Priority: LOW)**
1. ✅ Add optional metronome
2. ✅ Color code events by kit type
3. ✅ Add waveform visualization (if time permits)
4. ✅ Loop renaming/editing

---

## 🎨 **UI Mockup**

```
┌─────────────────────────────────────────────────────────────┐
│                         AirPad MVP                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [9-Pad Grid - Gesture Control Area]                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LOOP TIMELINE                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Bar 1    │    Bar 2    │    Bar 3    │    Bar 4   │   │
│  │  ────────────────────────────────────────────────── │   │
│  │  ▲ Playhead                                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  LOOP TRACKS                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔊 Loop 1: ●──●────●──●────●──●────●──●────       │   │
│  │ 🔊 Loop 2: ──●────●────────●────────●──────       │   │
│  │ 🔇 Loop 3: ●────────●──●────────────●──●──        │   │
│  │ 🎵 PREVIEW: ●──●──────●────●──●──────●────        │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  PREVIEW MODE: Hear your loop before saving                │
│  [✓ Save Loop]  [✗ Discard]  [↺ Re-record]                │
├─────────────────────────────────────────────────────────────┤
│  Voice Controls: 🎤 Listening...  Last: "record"           │
│  [Record] [Stop] [Clear] [Play All] [Stop All] [🔔 Click]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Architecture**

### **New Components:**
1. `components/loops/LoopTimeline.tsx` - Timeline with playhead
2. `components/loops/LoopTracks.tsx` - Multi-track visualization
3. `components/loops/PreviewControls.tsx` - Save/Discard buttons
4. `components/loops/Countdown.tsx` - Recording countdown overlay
5. `components/audio/Metronome.ts` - Click track

### **New Store State:**
```typescript
interface LoopStore {
  // Existing
  savedLoops: LoopData[]
  currentLoop: RecordedEvent[]
  isRecording: boolean
  isPlaying: boolean
  
  // NEW
  masterLoopLength: number       // Fixed loop length in ms
  loopBpm: number               // Tempo
  playheadPosition: number      // Current position 0-1
  previewLoop: LoopData | null  // Loop being previewed
  isPreviewMode: boolean        // True when previewing
  countdownValue: number        // 3, 2, 1, 0
  isCountingDown: boolean       // True during countdown
}
```

### **New Audio Logic:**
```typescript
class LoopManager {
  // NEW METHODS
  setMasterLoopLength(lengthMs: number): void
  waitForLoopBoundary(): Promise<void>
  startCountdown(): Promise<void>
  playPreviewWithSaved(): void
  quantizeToGrid(timestamp: number): number  // Snap to nearest beat
}
```

---

## ✅ **Success Criteria**

### **Must Have:**
- ✅ Recordings start in sync with existing loops
- ✅ Visual timeline shows current position
- ✅ Preview new loop before saving
- ✅ Countdown before recording starts
- ✅ Events visible on timeline

### **Should Have:**
- ✅ Multi-track visualization
- ✅ Mute/solo individual loops
- ✅ Bar and beat markers
- ✅ Re-record option

### **Nice to Have:**
- ✅ Metronome click track
- ✅ Color-coded events by kit
- ✅ Waveform visualization
- ✅ Loop editing/trimming

---

## 📚 **References**

### **Similar Apps (for inspiration):**
- **Ableton Live:** Loop view with clips
- **Boss RC-505:** Loop station with track visualization
- **GarageBand:** Multi-track with timeline
- **Loopy HD:** iPad loop station with visual feedback

### **Key UX Principles:**
1. **Visual Feedback:** Always show where you are
2. **Preview Before Commit:** Let users hear before saving
3. **Sync to Grid:** Everything aligns to musical timing
4. **Clear Actions:** Obvious buttons for Save/Discard

---

**Status:** 📋 Design Complete - Ready for Implementation  
**Priority:** P0 (Critical for MVP usability)  
**Estimated Time:** 2-3 days  
**Impact:** Transforms loop station from broken to professional-grade


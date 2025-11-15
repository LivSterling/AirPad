# Loop Sync & Visualization - TODO List

## 🎯 **Overview**
Comprehensive fixes for loop synchronization, visualization, and preview functionality.

---

## ✅ **TODO List by Priority**

### **🔴 PHASE 1: Critical - Loop Sync (Do First)**

#### **1.1 Master Loop Timing System**
- [ ] `loop-sync-1`: Implement master loop timing system
  - Create `MasterLoopConfig` interface
  - Set fixed loop length (4 bars = 8 seconds at 120 BPM)
  - First recording sets the master loop length
  - All subsequent loops sync to this length
  - **Files:** `lib/audio/LoopManager.ts`, `lib/store/index.ts`

#### **1.2 Countdown Before Recording**
- [ ] `loop-sync-2`: Add countdown visual (3-2-1)
  - Create `Countdown.tsx` component
  - Show countdown overlay when "record" is triggered
  - Display: "3... 2... 1... Recording!"
  - **Files:** `components/loops/Countdown.tsx`

#### **1.3 Sync to Loop Boundary**
- [ ] `loop-sync-3`: Wait for loop restart before recording
  - Calculate time until next loop boundary
  - Trigger countdown during wait
  - Start recording exactly at loop start
  - Auto-stop recording at loop end
  - **Files:** `lib/audio/LoopManager.ts`

---

### **🟡 PHASE 2: High Priority - Preview Mode**

#### **2.1 Preview State Management**
- [ ] `loop-preview-3`: Keep loop in temporary state
  - Add `previewLoop` to store
  - Add `isPreviewMode` flag
  - Don't auto-save after recording
  - **Files:** `lib/store/index.ts`, `types/index.ts`

#### **2.2 Preview Playback**
- [ ] `loop-preview-1`: Play preview alongside saved loops
  - Play `previewLoop` + `savedLoops` together
  - Keep them in sync
  - Loop the preview continuously
  - **Files:** `lib/audio/LoopManager.ts`

#### **2.3 Save/Discard UI**
- [ ] `loop-preview-2`: Add confirmation buttons
  - Create `PreviewControls.tsx` component
  - Buttons: [✓ Save Loop] [✗ Discard] [↺ Re-record]
  - Only save on user confirmation
  - **Files:** `components/loops/PreviewControls.tsx`, `pages/index.tsx`

---

### **🟢 PHASE 3: Medium Priority - Timeline Visualization**

#### **3.1 Loop Timeline Component**
- [ ] `loop-ui-1`: Create timeline with playhead
  - Create `LoopTimeline.tsx` component
  - Show 4 bars with divisions
  - Moving playhead indicator
  - Update 60fps during playback
  - **Files:** `components/loops/LoopTimeline.tsx`

#### **3.2 Event Visualization**
- [ ] `loop-viz-2`: Show event markers on timeline
  - Display dots where sounds trigger
  - Position based on timestamp
  - Color code by kit type
  - **Files:** `components/loops/LoopTimeline.tsx`

#### **3.3 Bar & Beat Markers**
- [ ] `loop-viz-1`: Add grid divisions
  - Show bar numbers (1, 2, 3, 4)
  - Subtle beat grid lines
  - Highlighted downbeats
  - **Files:** `components/loops/LoopTimeline.tsx`

---

### **🔵 PHASE 4: Medium Priority - Multi-Track View**

#### **4.1 Loop Tracks Component**
- [ ] `loop-ui-2`: Create multi-track visualization
  - Create `LoopTracks.tsx` component
  - Show each saved loop as a track
  - Display preview track separately
  - **Files:** `components/loops/LoopTracks.tsx`

#### **4.2 Track Event Markers**
- [ ] `loop-viz-3`: Show events per track
  - Event dots for each loop
  - Color coded by kit
  - Positioned by timestamp
  - **Files:** `components/loops/LoopTracks.tsx`

#### **4.3 Mute/Solo Controls**
- [ ] Add mute/solo buttons per track
  - Toggle individual loops on/off
  - Visual indicator (🔊/🔇)
  - Update `activeLoops` in store
  - **Files:** `components/loops/LoopTracks.tsx`

---

### **⚪ PHASE 5: Nice to Have - Polish**

#### **5.1 Metronome**
- [ ] `loop-metronome-1`: Add click track
  - Create `Metronome.ts` class
  - High beep on beat 1, low on others
  - Toggle on/off
  - Sync to BPM
  - **Files:** `lib/audio/Metronome.ts`

#### **5.2 Visual Polish**
- [ ] Add animations
  - Pulse on beat
  - Flash on event trigger
  - Smooth playhead movement

#### **5.3 Advanced Features**
- [ ] Loop renaming
- [ ] Loop color customization
- [ ] Waveform visualization
- [ ] Quantization settings

---

## 📋 **Implementation Order**

### **Day 1: Core Sync (CRITICAL)**
1. ✅ Master loop timing system
2. ✅ Countdown component
3. ✅ Sync to boundary logic
4. ✅ Test: Loops record in sync

### **Day 2: Preview Mode (HIGH)**
5. ✅ Preview state management
6. ✅ Preview playback
7. ✅ Save/Discard UI
8. ✅ Test: Preview before saving works

### **Day 3: Visualization (MEDIUM)**
9. ✅ LoopTimeline component
10. ✅ Event markers
11. ✅ LoopTracks component
12. ✅ Test: Can see loop position and events

### **Day 4: Polish (OPTIONAL)**
13. ✅ Metronome
14. ✅ Mute/solo controls
15. ✅ Animations
16. ✅ Final testing

---

## 🔧 **Technical Dependencies**

### **New Files to Create:**
```
components/
  loops/
    LoopTimeline.tsx        # Timeline with playhead
    LoopTracks.tsx          # Multi-track view
    PreviewControls.tsx     # Save/Discard buttons
    Countdown.tsx           # 3-2-1 countdown
lib/
  audio/
    Metronome.ts           # Click track (optional)
```

### **Files to Modify:**
```
lib/audio/LoopManager.ts      # Add sync logic
lib/store/index.ts            # Add preview state
types/index.ts                # Add new interfaces
pages/index.tsx               # Add new components
```

### **New Store State:**
```typescript
{
  masterLoopLength: number      // 8000ms (4 bars at 120 BPM)
  loopBpm: number              // 120
  playheadPosition: number     // 0-1 (for visualization)
  previewLoop: LoopData | null // Temporary loop
  isPreviewMode: boolean       // True when previewing
  countdownValue: number       // 3, 2, 1, 0
}
```

---

## ✅ **Testing Checklist**

### **Sync Testing:**
- [ ] First loop records for exactly 4 bars
- [ ] Second loop starts at boundary (in sync)
- [ ] Third loop also starts at boundary
- [ ] All loops play in perfect sync
- [ ] Countdown shows before recording

### **Preview Testing:**
- [ ] Recording stops but doesn't auto-save
- [ ] Preview plays with existing loops
- [ ] Can hear result before deciding
- [ ] "Save" button adds to saved loops
- [ ] "Discard" button removes preview
- [ ] "Re-record" starts new recording

### **Visualization Testing:**
- [ ] Playhead moves smoothly
- [ ] Events show at correct positions
- [ ] Each loop visible as separate track
- [ ] Preview track shows separately
- [ ] Mute/solo buttons work

---

## 📚 **User Stories**

### **Story 1: First Loop**
> "As a user, I say 'record', see a countdown, then record a 4-bar drum beat. When I say 'stop', I hear it play back and can decide to save or re-do it."

### **Story 2: Second Loop**
> "As a user, while my first loop is playing, I say 'record'. I see a countdown and it starts recording right when the loop restarts, so my bass line is perfectly in sync with the drums."

### **Story 3: Visualization**
> "As a user, I can see a timeline showing where I am in the loop, with dots showing where each sound triggers. Each of my saved loops appears as a track, like in a DAW."

---

## 🎯 **Success Metrics**

- ✅ Loops record in perfect sync (no drift)
- ✅ Users can preview before saving
- ✅ Visual feedback shows loop position
- ✅ Can see all loops as tracks
- ✅ Professional loop station feel

---

**Status:** 📋 Ready to Implement  
**Priority:** P0 (Critical for MVP)  
**Estimated Time:** 3-4 days  
**Impact:** Transforms app from broken to production-ready


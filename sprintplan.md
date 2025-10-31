# AirPad MVP - Final Polish Sprint Plan
## Bug Fixes & Feature Completion

---

## 🎯 **Sprint Goal**
Fix all critical bugs and complete missing functionality to deliver a fully working MVP of AirPad.

**Duration:** 1 Day Sprint  
**Priority:** Critical bugs first, then polish and UX improvements

---

## 🚨 **Critical Issues (Must Fix)**

### **P0 - Blocking Issues**

#### **Issue #1: Recording Functionality Not Working**
- **Problem:** Record button doesn't capture audio events
- **Root Cause:** Recording state not properly connected to event capture system
- **Fix Required:**
  - Verify `LoopManager` is capturing events during recording
  - Ensure `RecordedEvent` objects are being created with correct timestamps
  - Check `AudioStoreConnector` is properly handling recording state changes
  - Validate event capture in `AudioEngine.triggerPad()` during recording
- **Files to Check:**
  - `lib/audio/LoopManager.ts` - event capture logic
  - `lib/audio/AudioEngine.ts` - recording state handling
  - `lib/integration/AudioStoreConnector.ts` - state sync
- **Estimate:** 2 hours
- **Priority:** P0 - CRITICAL

#### **Issue #2: Play All Functionality Not Working**
- **Problem:** "Play All" button doesn't play saved loops
- **Root Cause:** Loop playback system not properly scheduling saved loops
- **Fix Required:**
  - Verify `LoopManager.playAllLoops()` is being called
  - Check loop scheduling in Tone.js Transport
  - Ensure saved loops are properly stored in Zustand state
  - Validate loop event timing and playback
- **Files to Check:**
  - `lib/audio/LoopManager.ts` - playback logic
  - `lib/store/index.ts` - saved loops state
  - `components/ui/FallbackControls.tsx` - button connection
- **Estimate:** 2 hours
- **Priority:** P0 - CRITICAL

#### **Issue #3: Duplicate Control Menus**
- **Problem:** Two menus are layered over each other
- **Root Cause:** Both `VoiceControls` and `FallbackControls` components rendering overlapping UI
- **Fix Required:**
  - Consolidate into single control bar at bottom
  - Remove duplicate UI elements from `VoiceControls`
  - Keep voice status indicator separate from controls
- **Files to Modify:**
  - `components/controls/VoiceControls.tsx` - remove redundant UI
  - `pages/index.tsx` - adjust layout
- **Estimate:** 1 hour
- **Priority:** P0 - CRITICAL

---

## 🔧 **High Priority Fixes (Should Fix)**

#### **Issue #4: "Close" Voice Command Not Working**
- **Problem:** Saying "close" doesn't close the instructions overlay
- **Root Cause:** Command mapping issue or state not updating
- **Fix Required:**
  - Verify "close help" command is registered in `vocab.ts`
  - Check `VoiceControls` command handler for "close help"
  - Ensure `onInstructionsToggle(false)` is being called
  - Test with variations: "close", "close help", "hide"
- **Files to Check:**
  - `lib/voice/vocab.ts` - command definitions
  - `components/controls/VoiceControls.tsx` - command handler
- **Estimate:** 30 minutes
- **Priority:** P1

#### **Issue #5: Synth Kit Voice Recognition Fails**
- **Problem:** "Synth" not being recognized by speech API
- **Solution:** Rebrand as "Funk Kit" throughout app
- **Changes Required:**
  - Update kit type from `'synth'` to `'funk'` in types
  - Update voice commands: "funk", "funk kit", "kit funk"
  - Update UI labels and emoji (🎛️ Funk Kit)
  - Update help section with new commands
  - Update status display
  - Keep file paths as `/kits/synth/` (no need to rename folders)
- **Files to Modify:**
  - `types/index.ts` - update `KitType` type
  - `lib/voice/vocab.ts` - add funk commands
  - `components/ui/InstructionsOverlay.tsx` - update help text
  - `components/ui/StatusDisplay.tsx` - update display
  - `components/ui/FallbackControls.tsx` - update button label
  - `lib/utils/helpers.ts` - add alias mapping for 'funk' → 'synth' folder
- **Estimate:** 1.5 hours
- **Priority:** P1

#### **Issue #6: Missing "Stop All" Voice Command**
- **Problem:** No voice command to stop loop playback
- **Fix Required:**
  - Add "stop all" to `vocab.ts`
  - Implement handler in `VoiceControls`
  - Call `useAppStore.getState().setPlaying(false)`
  - Add voice feedback: "All loops stopped"
- **Files to Modify:**
  - `lib/voice/vocab.ts` - add command
  - `components/controls/VoiceControls.tsx` - add handler
- **Estimate:** 20 minutes
- **Priority:** P1

#### **Issue #7: Missing Help Button Fallback**
- **Problem:** No manual button to open instructions if voice fails
- **Fix Required:**
  - Add "❓ Help" button to `FallbackControls` component
  - Position near other control buttons
  - Wire up to toggle instructions overlay
- **Files to Modify:**
  - `components/ui/FallbackControls.tsx` - add help button
  - `pages/index.tsx` - pass `onHelpToggle` prop
- **Estimate:** 30 minutes
- **Priority:** P1

---

## ✨ **Feature Additions (Nice to Have)**

#### **Issue #8: No Command to Stop Active Sounds**
- **Problem:** Can't stop a currently playing sound triggered by pinch
- **Solution:** Add "stop sound" or "silence" command
- **Implementation:**
  - Create method in `AudioEngine` to stop all currently playing players
  - Add voice command: "silence", "stop sound", "quiet"
  - Add keyboard shortcut (Space bar or Escape)
  - Add fallback button (🔇 Silence)
- **Files to Modify:**
  - `lib/audio/AudioEngine.ts` - add `stopAllActiveSounds()` method
  - `lib/voice/vocab.ts` - add silence commands
  - `components/controls/VoiceControls.tsx` - add handler
  - `components/ui/FallbackControls.tsx` - add silence button
- **Estimate:** 1 hour
- **Priority:** P2

---

## 🧪 **Testing Checklist**

### **Recording & Playback (Critical)**
- [ ] Click "Record" button → recording starts (red indicator shows)
- [ ] Pinch pads while recording → events are captured
- [ ] Click "Stop" → recording stops
- [ ] Recording event count increases during recording
- [ ] Click "Record" again → previous recording clears (or saves if "save loop" used)
- [ ] Say "save loop" → loop is saved (counter increments)
- [ ] Click "Play All" → saved loops play back in sync
- [ ] Click "Stop All" → playback stops

### **Voice Commands (All)**
- [ ] "record" → starts recording (voice feedback)
- [ ] "stop" → stops recording (voice feedback)
- [ ] "clear" → clears current recording
- [ ] "save loop" → saves current recording
- [ ] "play all" → plays all saved loops
- [ ] "stop all" → stops all loop playback
- [ ] "drums" → switches to drum kit
- [ ] "piano" → switches to piano kit
- [ ] "funk" / "funk kit" → switches to funk kit (formerly synth)
- [ ] "help" / "open help" → opens instructions
- [ ] "close" / "close help" → closes instructions
- [ ] "silence" → stops all active sounds (NEW)

### **UI/UX**
- [ ] Single control bar at bottom (no duplicates)
- [ ] Help button visible and functional
- [ ] Kit labels show "Funk Kit" instead of "Synth Kit"
- [ ] Status display shows correct kit name
- [ ] Instructions overlay shows correct commands
- [ ] No overlapping UI elements

### **Kit Switching**
- [ ] All 3 kits load samples correctly
- [ ] Voice commands switch kits
- [ ] Button clicks switch kits
- [ ] UI updates to show current kit
- [ ] Pads trigger correct sounds for each kit

---

## 📋 **Implementation Order**

### **Phase 1: Critical Bugs (4 hours)**
1. Fix Recording System (Issue #1) - 2h
2. Fix Play All System (Issue #2) - 2h
3. Remove Duplicate Menus (Issue #3) - 1h
4. Add Help Button (Issue #7) - 30min

### **Phase 2: Voice Command Fixes (2 hours)**
5. Fix "Close" Command (Issue #4) - 30min
6. Rebrand Synth → Funk Kit (Issue #5) - 1.5h
7. Add "Stop All" Command (Issue #6) - 20min

### **Phase 3: Feature Addition (1 hour)**
8. Add "Silence" Command (Issue #8) - 1h

### **Phase 4: Testing & Polish (2 hours)**
9. Full voice command testing - 1h
10. Recording/playback workflow testing - 30min
11. UI/UX polish and edge cases - 30min

---

## 🎯 **Success Criteria**

### **MVP Complete When:**
- ✅ All voice commands work reliably
- ✅ Recording captures events and plays back correctly
- ✅ Loop stacking works (save multiple loops, play all)
- ✅ All 3 kits (drums, piano, funk) are fully functional
- ✅ UI is clean with no duplicate elements
- ✅ Fallback buttons work for all features
- ✅ Instructions are accurate and accessible
- ✅ App works end-to-end: pinch → record → save → play all

---

## 📝 **Notes**

### **Why "Funk Kit" Instead of "Synth"?**
The speech recognition API struggles with "synth" (often hears "since", "cents", etc.). "Funk" is more distinct and easier to recognize. The kit contains Brazilian funk samples, making the name appropriate.

### **Recording System Architecture**
The recording system should work as follows:
1. User clicks "Record" or says "record"
2. `isRecording` state set to `true` in Zustand store
3. `AudioEngine.triggerPad()` checks recording state
4. If recording, creates `RecordedEvent` with timestamp and pad info
5. Event added to `currentLoop` array in store
6. User says "save loop" → `currentLoop` moved to `savedLoops` array
7. User says "play all" → `LoopManager` schedules all loops with Tone.js Transport

### **Potential Issues to Watch For**
- Tone.js Transport not started before scheduling loops
- Timestamp synchronization (use `Tone.now()` not `Date.now()`)
- Loop length calculation and modulo timing
- Race conditions between state updates and audio engine

---

## ⏱️ **Estimated Total Time: 9 hours**
**Target Completion: End of Day**


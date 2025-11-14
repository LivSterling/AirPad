# AirPad MVP - Project Board
## 2-Day Sprint Task Breakdown

---

## 🎯 **Sprint Goals**
- Working hands-free air instrument web app
- 3×3 grid with pinch detection
- Voice-controlled recording and playback
- 3 sound kits with loop stacking

**Tech Stack:** Next.js + TypeScript + Tone.js + MediaPipe + Web Speech API + Tailwind

---

## 📅 **Timeline Overview**

### **Day 1: Foundation & Core Systems**
- Project setup and architecture
- Hand tracking implementation  
- Basic audio engine
- UI foundation

### **Day 2: Integration & Features**
- Voice command system
- Recording/looping functionality
- Feature integration and testing
- MVP polish

---

## 👷 **Team Task Assignments**

### **🏗️ ARCHITECT**

#### **Day 1 (8 hours)**
- **T1.1** Project Setup & Dependencies 
  - Initialize Next.js TypeScript project
  - Install all dependencies (Tone.js, MediaPipe, etc.)
  - Configure build system and dev environment
  - Set up folder structure
  - *Dependency: None - START HERE*

- **T1.2** System Architecture Design 
  - Define app state management structure
  - Design audio engine singleton pattern
  - Plan component hierarchy
  - Create integration interfaces between subsystems
  - *Dependency: T1.1*

- **T1.3** Audio Engine Foundation 
  - Set up Tone.js Transport and timing
  - Create sample loading system
  - Implement master limiter
  - Design kit switching architecture
  - *Dependency: T1.1, Can run parallel with Dev work*

#### **Day 2 (4 hours)**
- **T2.1** Integration Support 
  - Resolve integration issues between components
  - Performance optimization
  - Architecture refinements
  - *Dependency: All Day 1 tasks*

- **T2.2** Deployment Preparation 
  - Build optimization
  - Environment configuration
  - Basic deployment setup
  - *Dependency: Working MVP*

---

### **💻 FRONTEND DEV 1** (Core Systems)

#### **Day 1 (8 hours)**
- **T1.4** MediaPipe Integration 
  - Set up MediaPipe Hands library
  - Implement hand detection and tracking
  - Create pinch detection algorithm (distance < 0.04)
  - Add gesture cooldown system (220ms)
  - *Dependency: T1.1*

- **T1.5** Hand-to-Grid Mapping 
  - Map hand coordinates to 3×3 grid
  - Implement hover detection and highlighting
  - Create pad targeting system
  - *Dependency: T1.4*

- **T1.6** Audio Triggering System 
  - Connect pinch detection to sound playback
  - Implement per-pad sound triggering
  - Add audio latency optimization
  - *Dependency: T1.3, T1.5*

#### **Day 2 (8 hours)**
- **T2.3** Recording Engine 
  - Implement event capture during recording
  - Create master loop length system
  - Build loop scheduling and playback
  - Add modulo timing for subsequent takes
  - *Dependency: T1.6, T2.5*

- **T2.4** Loop Stacking System 
  - Create loop layer management
  - Implement "save loop" functionality
  - Build stack playback system ("play all")
  - Add individual layer control
  - *Dependency: T2.3*

- **T2.5** Kit System Implementation 
  - Load and organize 3 sound kits (drum/piano/synth)
  - Implement kit switching mechanism
  - Connect to voice commands
  - *Dependency: T1.3, parallel with recording work*

---

### **🎨 FRONTEND DEV 2** (UI & Voice)

#### **Day 1 (8 hours)**
- **T1.7** UI Foundation 
  - Create 3×3 grid layout with Tailwind
  - Implement visual feedback for pad states
  - Add hover/active highlighting
  - Basic responsive design
  - *Dependency: T1.1*

- **T1.8** Voice Command Setup 
  - Integrate Web Speech API
  - Implement speech recognition
  - Create command parsing system
  - Add speech synthesis for feedback
  - *Dependency: T1.1, can run parallel with UI*

- **T1.9** Basic Voice Commands 
  - Implement "record" and "stop" commands
  - Add kit switching ("set kit drum/piano/synth")
  - Create voice feedback confirmations
  - *Dependency: T1.8*

#### **Day 2 (8 hours)**
 
  - *Dependency: T2.8*

---

### **🧪 QA**

#### **Day 1 (6 hours)**
- **T1.10** Environment & Permission Testing *(2h)*
  - Test camera/audio permissions flow
  - Verify browser compatibility (Chrome/Firefox)
  - Check MediaPipe loading and performance
  - *Dependency: T1.1, T1.4*

- **T1.11** Hand Tracking Validation *(2h)*
  - Test pinch detection accuracy
  - Validate grid mapping precision
  - Check gesture cooldown timing
  - Test edge cases (hand outside frame, multiple hands)
  - *Dependency: T1.4, T1.5*

- **T1.12** Audio System Testing *(2h)*
  - Verify sound triggering latency
  - Test kit switching functionality
  - Validate audio quality and limiter
  - Check for audio clicks/pops
  - *Dependency: T1.6, T1.3*

#### **Day 2 (8 hours)**
- **T2.10** Voice Command Testing *(3h)*
  - Test all voice commands in various environments
  - Validate speech recognition accuracy
  - Check command parsing edge cases
  - Test voice feedback system
  - *Dependency: T2.6*

- **T2.11** Recording & Loop Testing *(3h)*
  - Test recording start/stop functionality
  - Validate loop length consistency
  - Check loop stacking accuracy
  - Test "clear" and "save loop" commands
  - *Dependency: T2.3, T2.4*

- **T2.12** Integration & End-to-End Testing *(2h)*
  - Full user workflow testing
  - Cross-browser compatibility check
  - Performance testing with multiple loops
  - Error handling and edge case validation
  - *Dependency: All features complete*

---

## 🔄 **Dependency Chain & Critical Path**

### **Critical Path:**
1. T1.1 (Project Setup) → 
2. T1.4 (MediaPipe) → T1.5 (Grid Mapping) → T1.6 (Audio Triggering) → 
3. T2.3 (Recording) → T2.4 (Loop Stacking) → 
4. T2.12 (Final Testing)

### **Parallel Streams:**
- **Architecture**: T1.3 (Audio Engine) can run parallel with Dev 1 tracking work
- **UI Development**: T1.7-T1.8 can run parallel with core systems
- **QA**: Testing runs continuously alongside development
- **Voice Commands**: T1.8-T1.9 can develop parallel with hand tracking

---

## ⚡ **Daily Checkpoints**

### **End of Day 1 Success Criteria:**
- [ ] Project builds and runs locally
- [ ] Camera permissions working
- [ ] Basic hand tracking detects pinches
- [ ] Sounds trigger when pinching over grid squares
- [ ] Basic UI grid displays correctly
- [ ] Voice recognition captures "record" and "stop" commands

### **End of Day 2 Success Criteria:**
- [ ] Full recording and loop playback working
- [ ] Loop stacking with "save loop" functional
- [ ] All voice commands working
- [ ] Kit switching operational
- [ ] Instructions overlay toggles correctly
- [ ] Basic error handling and fallbacks in place
- [ ] Works reliably in Chrome desktop

---

## 🚨 **Risk Mitigation**

### **High Risk Items:**
- **MediaPipe Performance**: Have WebRTC fallback ready
- **Audio Latency**: Prioritize Tone.js optimization early
- **Voice Recognition**: Implement fallback buttons
- **Browser Permissions**: Test permission flows early

### **MVP Scope Protection:**
- If stems system is complex, deprioritize for v1
- Focus on drum kit first, add piano/funk if time permits
- Instructions can be simple text overlay if needed
- Advanced gesture detection can be simplified to basic pinch

---

## 📊 **Resource Allocation Summary**
- **Total Team Hours**: 54 hours over 2 days
- **Architect**: 12 hours (front-loaded)
- **Frontend Dev 1**: 16 hours (core tech heavy)
- **Frontend Dev 2**: 16 hours (UI and voice)
- **QA**: 14 hours (continuous testing)

**Success depends on**: Early foundation setup, parallel development, and continuous integration testing.

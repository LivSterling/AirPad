# AirPad MVP - 2-Day Build Plan

## Goal
Build a hands-free "air instrument" web app where users pinch over on-screen squares to trigger sounds, record loops, and stack multiple layers using voice commands.

## Core MVP Features

### 1. Air Pads (3×3 Grid)
- **Hand Tracking**: Webcam-based pinch detection over grid squares
- **Sound Triggering**: Pinch gesture plays assigned sound with visual feedback
- **Kit System**: 3 kits (drum, piano, synth) with 9 sounds each - kits are in kits folder
- **Voice Control**: "drum kit", "piano kit", "funk kit" for instant switching

### 2. Record → Loop System
- **Voice Recording**: "record" starts capture, "stop" ends and sets master loop length
- **Master Loop**: First recording defines the loop length for all subsequent takes
- **Auto-Loop**: Recorded takes immediately start looping
- **Clear Function**: "clear" removes current working take (preserves master length)

### 3. Loop Stacking
- **Save Layers**: "save loop" adds current take to the stack
- **Stack Control**: "play all" and "stop all" for synchronized playback
- **Multi-Layer**: Multiple saved loops play simultaneously

### 4. Voice Commands
- Recording: "record", "stop", "clear"
- Playback: "play all", "stop all"
- Kits: "drum kit", "piano kit", "funk kit"
- Optional: "toggle instrumental", "toggle vocal" for backing tracks
- Help: "open instructions", "close instructions" 
- all words and intents are in vocab.ts

### 5. Audio Feedback
- Brief TTS confirmations for voice commands
- Audio limiter to prevent clipping

## Tech Stack (JavaScript/TypeScript Only)

### Frontend Framework
- **Next.js (TypeScript)** 
- Simple single-page application

### Audio Engine
- **Tone.js**: Transport timing, audio players, effects, and limiter
- Pre-loaded sound samples for each kit

### Computer Vision
- **MediaPipe Hands**
- Track index finger tip + thumb tip for pinch detection

### Voice Processing
- **Web Speech API**: SpeechRecognition for commands, SpeechSynthesis for feedback

### Styling & State
- **Tailwind CSS**: Minimal, utility-first styling
- **React State**: Component state + module-level audio singletons
- **Optional**: localStorage for kit preference and loop stack persistence

## Design Considerations

### Performance Targets
- **Low Latency**: <50ms from pinch to sound trigger
- **Reliable Tracking**: Works consistently at 640×480 webcam resolution
- **Browser Support**: Chrome desktop (primary target)

### User Experience
- **Visual Feedback**: Clear highlight when targeting a pad
- **Audio Safety**: Limiter prevents ear damage from stacked loops
- **Simple Interface**: Minimal UI, voice-first interaction
- **Immediate Gratification**: First successful pinch should feel responsive

### Technical Constraints
- **Loop Sync**: All loops must stay perfectly synchronized
- **Memory Management**: Handle audio buffers efficiently for stacking
- **Error Handling**: Graceful fallbacks for failed voice recognition
- **Webcam Permissions**: Clear prompts for camera access

## 2-Day Development Strategy

### Day 1: Core Foundation
- Set up project structure and basic UI
- Implement hand tracking and pinch detection
- Build 3×3 grid with visual feedback
- Load first sound kit and test audio triggering
- Basic voice command recognition

### Day 2: Recording & Stacking
- Implement loop recording with master length logic
- Build loop stacking system with synchronized playback
- Add remaining voice commands and TTS feedback
- Polish UI and fix critical bugs
- Test full workflow end-to-end

## Success Criteria
✅ User can pinch over pads to trigger sounds reliably  
✅ Voice recording creates loops that immediately play back  
✅ Multiple loops can be stacked and played simultaneously  
✅ Kit switching works during active playback  
✅ All voice commands respond correctly  
✅ App works smoothly in Chrome desktop environment
✅ Whole app can be run without keyboard and mouse  

## Out of Scope (Post-MVP)
- User accounts and cloud storage
- Mobile optimization
- Advanced effects and filters
- Email sharing or social features
- Analytics and usage tracking
- Multi-user collaboration

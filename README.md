# AirPad

A hands-free loop station and beat maker that you control entirely with hand gestures and voice commands. Built for the Goose Hackathon challenge to create an app that works without keyboard or mouse.

**Live Demo:** [air-pad-gamma.vercel.app](https://air-pad-gamma.vercel.app)

## The Challenge

The Goose Hackathon had one rule: build something that doesn't need a keyboard or mouse. I decided to create a musical instrument you could play just by moving your hands in the air and talking to it.

## What It Does

AirPad is a loop station where you can:
- **Play sounds** by pinching your fingers over virtual drum pads
- **Record loops** by saying "record" and playing your beat
- **Layer multiple loops** on top of each other
- **Switch between kits** (drums, piano, funk) with voice commands
- **Control everything** without ever touching your keyboard

The camera watches your hands, and the microphone listens to your voice. That's it.

## How I Built It

I used Goose AI agents to build this in about a week. Instead of coding everything myself, I set up Goose sub-agents to act as a development team:

- **Planner Agent** - Broke down the project into tasks and managed priorities
- **Architect Agent** - Designed the system architecture and integration patterns
- **Frontend Dev 1** - Built the UI components and gesture controls
- **Frontend Dev 2** - Implemented the audio engine and loop system
- **QA Agent** - Tested features and caught bugs

The agents worked together like a real dev team, each handling their part while I coordinated and made decisions. It was wild watching them debug issues and suggest improvements.

## Tech Stack

- **Next.js** - React framework for the web app
- **Tone.js** - Audio synthesis and loop management
- **MediaPipe Hands** - Real-time hand tracking
- **Web Speech API** - Voice command recognition
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Features

**Gesture Control:**
- Pinch your fingers together over a pad to trigger sounds
- Each pad responds to your hand position in 3D space
- 9 pads in a grid layout

**Voice Commands:**
- "record" - Start recording a loop
- "stop" - Stop recording
- "play all" - Play all saved loops
- "drums" / "piano" / "funk" - Switch sound kits
- "clear" - Delete current recording
- "help" - Show instructions
- "silence" - Stop all sounds

**Loop Station:**
- Record multiple loops and layer them
- Each loop plays in sync
- Save and manage multiple loops
- Visual feedback for recording state

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and allow camera and microphone access.

## The Goose Experience

Building with AI agents was different than I expected. Instead of writing all the code myself, I spent time describing what I wanted and reviewing what the agents built. They caught bugs I would have missed and suggested patterns I hadn't thought of.

The coolest part was when the QA agent found an infinite loop bug where the voice feedback was triggering new commands. The frontend devs fixed it by removing audio feedback entirely and keeping only visual confirmation. That kind of back-and-forth felt surprisingly natural.

## Challenges

- Getting hand tracking to work smoothly in different lighting conditions
- Preventing voice feedback from triggering the microphone (infinite loops are real)
- Making loops actually sync up instead of drifting
- Balancing sensitivity so gestures feel responsive but not twitchy

## What's Next

The loop sync still needs work. Recordings don't always line up perfectly, and there's no visual timeline to see where you are in a loop. I have designs for a preview mode where you can hear a loop before saving it, plus a multi-track view like you'd see in a DAW.

But for a week of work with AI agents? I'm pretty happy with it.

## License

MIT

## Acknowledgments

Built for the Goose Hackathon. Thanks to the Goose team for making AI agents that can actually build stuff.


import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AppStore, KitType, RecordedEvent, LoopData, PadIndex } from '../../types'
import { generateId } from '../utils/helpers'

interface StoreState extends AppStore {}

export const useAppStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial Audio State
        currentKit: 'drums' as KitType,
        isRecording: false,
        isPlaying: false,
        masterVolume: 0.8,
        bpm: 120,

        // Initial Loop State
        currentLoop: [],
        savedLoops: [],
        activeLoops: [],

        // Initial UI State
        activeView: 'performance' as const,
        showHelp: false,

        // Initial Control State
        gestureControlEnabled: false,
        voiceControlEnabled: false,
        airInstrumentMode: false,

        // Audio Actions
        setCurrentKit: (kit: KitType) => {
          set({ currentKit: kit }, false, 'setCurrentKit')
        },

        setRecording: (recording: boolean) => {
          set({ isRecording: recording }, false, 'setRecording')
        },

        setPlaying: (playing: boolean) => {
          set({ isPlaying: playing }, false, 'setPlaying')
        },

        setMasterVolume: (volume: number) => {
          const clampedVolume = Math.max(0, Math.min(1, volume))
          set({ masterVolume: clampedVolume }, false, 'setMasterVolume')
        },

        setBPM: (bpm: number) => {
          const clampedBPM = Math.max(60, Math.min(200, bpm))
          set({ bpm: clampedBPM }, false, 'setBPM')
        },

        // Loop Actions
        addRecordedEvent: (event: RecordedEvent) => {
          set(
            (state) => ({
              currentLoop: [...state.currentLoop, event]
            }),
            false,
            'addRecordedEvent'
          )
        },

        saveCurrentLoop: () => {
          const state = get()
          if (state.currentLoop.length === 0) return

          const newLoop: LoopData = {
            id: generateId(),
            events: [...state.currentLoop],
            duration: state.currentLoop.length > 0 
              ? Math.max(...state.currentLoop.map(e => e.timestamp)) 
              : 0,
            bpm: state.bpm,
            createdAt: new Date(),
            name: `Loop ${state.savedLoops.length + 1}`
          }

          set(
            (state) => ({
              savedLoops: [...state.savedLoops, newLoop],
              currentLoop: []
            }),
            false,
            'saveCurrentLoop'
          )
        },

        clearCurrentLoop: () => {
          set({ currentLoop: [] }, false, 'clearCurrentLoop')
        },

        addSavedLoop: (loop: LoopData) => {
          set(
            (state) => ({
              savedLoops: [...state.savedLoops, loop]
            }),
            false,
            'addSavedLoop'
          )
        },

        removeSavedLoop: (loopId: string) => {
          set(
            (state) => ({
              savedLoops: state.savedLoops.filter(loop => loop.id !== loopId),
              activeLoops: state.activeLoops.filter(id => id !== loopId)
            }),
            false,
            'removeSavedLoop'
          )
        },

        toggleActiveLoop: (loopId: string) => {
          set(
            (state) => {
              const isActive = state.activeLoops.includes(loopId)
              return {
                activeLoops: isActive
                  ? state.activeLoops.filter(id => id !== loopId)
                  : [...state.activeLoops, loopId]
              }
            },
            false,
            'toggleActiveLoop'
          )
        },

        // UI Actions
        setActiveView: (view: StoreState['activeView']) => {
          set({ activeView: view }, false, 'setActiveView')
        },

        toggleHelp: () => {
          set((state) => ({ showHelp: !state.showHelp }), false, 'toggleHelp')
        },

        // Control Actions
        setGestureControl: (enabled: boolean) => {
          set({ gestureControlEnabled: enabled }, false, 'setGestureControl')
        },

        setVoiceControl: (enabled: boolean) => {
          set({ voiceControlEnabled: enabled }, false, 'setVoiceControl')
        },

        setAirInstrumentMode: (enabled: boolean) => {
          set({ airInstrumentMode: enabled }, false, 'setAirInstrumentMode')
        }
      }),
      {
        name: 'airpad-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          masterVolume: state.masterVolume,
          bpm: state.bpm,
          savedLoops: state.savedLoops,
          gestureControlEnabled: state.gestureControlEnabled,
          voiceControlEnabled: state.voiceControlEnabled,
          currentKit: state.currentKit
        })
      }
    ),
    { name: 'AirPad Store' }
  )
)

// Selectors for optimized re-renders
export const useAudioState = () => useAppStore((state) => ({
  currentKit: state.currentKit,
  isRecording: state.isRecording,
  isPlaying: state.isPlaying,
  masterVolume: state.masterVolume,
  bpm: state.bpm
}))

export const useLoopState = () => useAppStore((state) => ({
  currentLoop: state.currentLoop,
  savedLoops: state.savedLoops,
  activeLoops: state.activeLoops
}))

export const useUIState = () => useAppStore((state) => ({
  activeView: state.activeView,
  showHelp: state.showHelp
}))

export const useControlState = () => useAppStore((state) => ({
  gestureControlEnabled: state.gestureControlEnabled,
  voiceControlEnabled: state.voiceControlEnabled,
  airInstrumentMode: state.airInstrumentMode
}))

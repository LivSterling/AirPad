/**
 * EventBus
 * 
 * Simple pub/sub event system for cross-subsystem communication.
 * Allows different systems (AudioEngine, HandTracker, VoiceController, Store, etc.)
 * to communicate without tight coupling.
 */

type EventCallback = (data: any) => void
type EventMap = Map<string, Set<EventCallback>>

/**
 * EventBus singleton for application-wide event communication
 */
export class EventBus {
  private static instance: EventBus
  private listeners: EventMap = new Map()

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * Subscribe to an event
   * 
   * @param event - Event name (e.g., "audio:loaded", "gesture:pinch")
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  public static on(event: string, callback: EventCallback): () => void {
    const bus = EventBus.getInstance()
    
    if (!bus.listeners.has(event)) {
      bus.listeners.set(event, new Set())
    }
    
    bus.listeners.get(event)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      bus.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Subscribe to an event that only fires once
   * 
   * @param event - Event name
   * @param callback - Function to call once
   */
  public static once(event: string, callback: EventCallback): void {
    const bus = EventBus.getInstance()
    
    const onceCallback = (data: any) => {
      callback(data)
      bus.listeners.get(event)?.delete(onceCallback)
    }
    
    bus.on(event, onceCallback)
  }

  /**
   * Emit an event to all subscribers
   * 
   * @param event - Event name
   * @param data - Data to pass to listeners
   */
  public static emit(event: string, data?: any): void {
    const bus = EventBus.getInstance()
    const callbacks = bus.listeners.get(event)
    
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event
   * 
   * @param event - Event name (or undefined to clear all)
   */
  public static off(event?: string): void {
    const bus = EventBus.getInstance()
    
    if (event) {
      bus.listeners.delete(event)
    } else {
      bus.listeners.clear()
    }
  }

  /**
   * Get number of listeners for an event
   */
  public static listenerCount(event: string): number {
    const bus = EventBus.getInstance()
    return bus.listeners.get(event)?.size ?? 0
  }

  /**
   * Get all registered events
   */
  public static getEvents(): string[] {
    const bus = EventBus.getInstance()
    return Array.from(bus.listeners.keys())
  }
}

/**
 * Standard Event Types used throughout the application
 * 
 * Naming convention: `system:action`
 * Example: `audio:kitChanged`, `gesture:padTriggered`, `error:audioInit`
 */
export const EventTypes = {
  // Audio Events
  AUDIO_INITIALIZED: 'audio:initialized',
  AUDIO_KIT_CHANGED: 'audio:kitChanged',
  AUDIO_VOLUME_CHANGED: 'audio:volumeChanged',
  AUDIO_BPM_CHANGED: 'audio:bpmChanged',
  
  // Recording Events
  RECORDING_STARTED: 'recording:started',
  RECORDING_STOPPED: 'recording:stopped',
  RECORDING_CLEARED: 'recording:cleared',
  LOOP_SAVED: 'loop:saved',
  
  // Playback Events
  PLAYBACK_STARTED: 'playback:started',
  PLAYBACK_STOPPED: 'playback:stopped',
  PLAYBACK_PAUSED: 'playback:paused',
  
  // Gesture Events
  GESTURE_PAD_TRIGGERED: 'gesture:padTriggered',
  GESTURE_PINCH_DETECTED: 'gesture:pinchDetected',
  GESTURE_HOVER_CHANGED: 'gesture:hoverChanged',
  
  // Voice Events
  VOICE_INITIALIZED: 'voice:initialized',
  VOICE_LISTENING: 'voice:listening',
  VOICE_COMMAND_RECEIVED: 'voice:commandReceived',
  VOICE_ERROR: 'voice:error',
  
  // Hand Tracking Events
  TRACKING_INITIALIZED: 'tracking:initialized',
  TRACKING_HAND_DETECTED: 'tracking:handDetected',
  TRACKING_HAND_LOST: 'tracking:handLost',
  
  // Error Events
  ERROR_AUDIO: 'error:audio',
  ERROR_GESTURE: 'error:gesture',
  ERROR_VOICE: 'error:voice',
  ERROR_TRACKING: 'error:tracking',
  
  // UI Events
  UI_THEME_CHANGED: 'ui:themeChanged',
  UI_MODAL_OPENED: 'ui:modalOpened',
  UI_MODAL_CLOSED: 'ui:modalClosed',
  
  // System Events
  APP_INITIALIZED: 'app:initialized',
  APP_ERROR: 'app:error',
  APP_SHUTDOWN: 'app:shutdown',
} as const

/**
 * Example usage:
 * 
 * ```typescript
 * // Subscribe to event
 * const unsubscribe = EventBus.on(EventTypes.AUDIO_KIT_CHANGED, (data) => {
 *   console.log('Kit changed to:', data.kitType)
 * })
 * 
 * // Emit event
 * EventBus.emit(EventTypes.AUDIO_KIT_CHANGED, { kitType: 'drums' })
 * 
 * // Unsubscribe
 * unsubscribe()
 * 
 * // Listen once
 * EventBus.once(EventTypes.APP_INITIALIZED, () => {
 *   console.log('App is ready!')
 * })
 * ```
 */

export default EventBus


import { Hands, Results } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

export class HandTracker {
  private static instance: HandTracker
  private hands: Hands | null = null
  private camera: Camera | null = null
  private isInitialized = false
  private lastPinchTime = 0
  private readonly PINCH_THRESHOLD = 0.04 // Distance threshold for pinch detection
  private readonly COOLDOWN_MS = 220 // Cooldown between pinch detections

  // Callbacks
  public onPinchDetected: ((padIndex: number) => void) | null = null
  public onHover: ((padIndex: number | null) => void) | null = null

  private constructor() {}

  public static getInstance(): HandTracker {
    if (!HandTracker.instance) {
      HandTracker.instance = new HandTracker()
    }
    return HandTracker.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Use lighter model for better performance
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      this.hands.onResults(this.onResults.bind(this))

      // Initialize camera
      const videoElement = document.getElementById('webcam') as HTMLVideoElement
      if (!videoElement) {
        throw new Error('Webcam video element not found')
      }

      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.hands) {
            await this.hands.send({ image: videoElement })
          }
        },
        width: 640,
        height: 480
      })

      await this.camera.start()
      this.isInitialized = true
      console.log('HandTracker initialized successfully')
    } catch (error) {
      console.error('Failed to initialize HandTracker:', error)
      throw error
    }
  }

  private onResults(results: Results): void {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      // No hands detected
      if (this.onHover) {
        this.onHover(null)
      }
      return
    }

    const landmarks = results.multiHandLandmarks[0]
    
    // Safety check for landmarks
    if (!landmarks || landmarks.length < 9) {
      return
    }
    
    // Get index finger tip (landmark 8) and thumb tip (landmark 4)
    const indexTip = landmarks[8]
    const thumbTip = landmarks[4]

    // Calculate distance between thumb and index finger
    const distance = this.calculateDistance(indexTip, thumbTip)
    
    // Check for pinch gesture
    const isPinching = distance < this.PINCH_THRESHOLD
    
    if (isPinching) {
      const now = Date.now()
      if (now - this.lastPinchTime > this.COOLDOWN_MS) {
        const padIndex = this.getPadFromHandPosition(indexTip)
        if (padIndex !== null && this.onPinchDetected) {
          this.onPinchDetected(padIndex)
          this.lastPinchTime = now
        }
      }
    } else {
      // Hovering - update hover state
      const padIndex = this.getPadFromHandPosition(indexTip)
      if (this.onHover) {
        this.onHover(padIndex)
      }
    }
  }

  private calculateDistance(point1: any, point2: any): number {
    const dx = point1.x - point2.x
    const dy = point1.y - point2.y
    const dz = point1.z - point2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  private getPadFromHandPosition(handPosition: any): number | null {
    // Map hand position to 3x3 grid
    // MediaPipe coordinates are normalized (0-1) with origin at top-left
    // The camera is typically mirrored for user comfort
    
    const x = 1 - handPosition.x // Mirror the x coordinate
    const y = handPosition.y     // Y stays the same (0 at top)
    
    // Define grid boundaries with more generous area coverage
    // These values work well for hands positioned in the center area of the camera
    const gridLeft = 0.2
    const gridRight = 0.8
    const gridTop = 0.15
    const gridBottom = 0.75
    
    // Check if hand is within grid area
    if (x < gridLeft || x > gridRight || y < gridTop || y > gridBottom) {
      return null
    }
    
    // Map to 3x3 grid with normalized coordinates
    const normalizedX = (x - gridLeft) / (gridRight - gridLeft)
    const normalizedY = (y - gridTop) / (gridBottom - gridTop)
    
    // Calculate column and row (0-2)
    const col = Math.floor(Math.min(normalizedX * 3, 2.999))
    const row = Math.floor(Math.min(normalizedY * 3, 2.999))
    
    // Ensure within bounds (safety check)
    if (col < 0 || col > 2 || row < 0 || row > 2) {
      return null
    }
    
    // Return pad index (0-8, left to right, top to bottom)
    return row * 3 + col
  }

  public stop(): void {
    if (this.camera) {
      this.camera.stop()
    }
    this.isInitialized = false
  }
}

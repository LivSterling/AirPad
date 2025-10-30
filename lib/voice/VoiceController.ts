// Import the vocabulary for intent matching
import { matchIntent } from '../../vocab'

export class VoiceController {
  private static instance: VoiceController
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private isInitialized = false
  private isListening = false

  // Callbacks
  public onCommand: ((command: string) => void) | null = null
  public onListeningChange: ((listening: boolean) => void) | null = null

  private constructor() {}

  public static getInstance(): VoiceController {
    if (!VoiceController.instance) {
      VoiceController.instance = new VoiceController()
    }
    return VoiceController.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check for Web Speech API support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Web Speech API not supported in this browser - voice commands disabled')
        this.isInitialized = true // Mark as initialized but disabled
        return
      }

      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.continuous = true
      this.recognition.interimResults = false
      this.recognition.lang = 'en-US'

      this.recognition.onstart = () => {
        this.isListening = true
        if (this.onListeningChange) {
          this.onListeningChange(true)
        }
        console.log('Voice recognition started')
      }

      this.recognition.onend = () => {
        this.isListening = false
        if (this.onListeningChange) {
          this.onListeningChange(false)
        }
        console.log('Voice recognition ended')
        
        // Restart recognition if it stops unexpectedly
        setTimeout(() => {
          if (this.isInitialized && !this.isListening) {
            this.startListening()
          }
        }, 1000)
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
        console.log('Voice input:', transcript)
        
        // Match transcript to intent
        const intent = matchIntent(transcript)
        if (intent) {
          this.processCommand(intent)
          this.speak(`${intent.replace(':', ' ')} command received`)
        } else {
          console.log('No matching intent found for:', transcript)
        }
      }

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access for voice commands.')
        }
      }

      // Initialize Speech Synthesis
      this.synthesis = window.speechSynthesis

      this.isInitialized = true
      
      // Start listening immediately
      this.startListening()
      
      console.log('VoiceController initialized successfully')
    } catch (error) {
      console.error('Failed to initialize VoiceController:', error)
      throw error
    }
  }

  public startListening(): void {
    if (!this.recognition || this.isListening) return
    
    try {
      this.recognition.start()
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) return
    
    this.recognition.stop()
  }

  public processCommand(command: string): void {
    console.log('Processing command:', command)
    
    if (this.onCommand) {
      this.onCommand(command)
    }
  }

  public speak(text: string): void {
    if (!this.synthesis) return

    // Cancel any ongoing speech
    this.synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.2
    utterance.pitch = 1
    utterance.volume = 0.8

    // Use a more robotic voice if available
    const voices = this.synthesis.getVoices()
    const robotVoice = voices.find(voice => 
      voice.name.includes('Microsoft David') || 
      voice.name.includes('Alex') ||
      voice.name.includes('Daniel')
    )
    
    if (robotVoice) {
      utterance.voice = robotVoice
    }

    this.synthesis.speak(utterance)
  }

  public stop(): void {
    if (this.recognition) {
      this.recognition.stop()
    }
    if (this.synthesis) {
      this.synthesis.cancel()
    }
    this.isInitialized = false
  }
}

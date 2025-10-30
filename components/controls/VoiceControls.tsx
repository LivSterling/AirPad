import React, { useEffect, useState } from 'react'
import { VoiceController } from '@/lib/voice/VoiceController'
import { useAppStore } from '@/lib/store'
import type { KitType } from '@/types'

interface VoiceControlsProps {
  onKitChange: (kit: KitType) => void
  onRecordingChange: (isRecording: boolean) => void
  onInstructionsToggle: (show: boolean) => void
}

export default function VoiceControls({ 
  onKitChange, 
  onRecordingChange, 
  onInstructionsToggle 
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<string>('')
  const store = useAppStore()

  useEffect(() => {
    const voiceController = VoiceController.getInstance()
    
    // Set up voice command callbacks
    voiceController.onCommand = (command: string) => {
      setLastCommand(command)
      
      // Handle different commands
      switch (command) {
        case 'record':
          onRecordingChange(true)
          store.setRecording(true)
          voiceController.speak('Recording started')
          break
        case 'stop':
          onRecordingChange(false)
          store.setRecording(false)
          voiceController.speak('Recording stopped')
          break
        case 'clear':
          store.clearCurrentLoop()
          voiceController.speak('Loop cleared')
          break
        case 'save loop':
          if (store.currentLoop.length === 0) {
            voiceController.speak('No recording to save')
          } else {
            store.saveCurrentLoop()
            voiceController.speak(`Loop saved with ${store.currentLoop.length} events`)
          }
          break
        case 'play all':
          if (store.savedLoops.length === 0) {
            voiceController.speak('No saved loops to play')
          } else {
            store.setPlaying(true)
            voiceController.speak(`Playing ${store.savedLoops.length} loops`)
          }
          break
        case 'stop all':
          store.setPlaying(false)
          voiceController.speak('All loops stopped')
          break
        case 'open help':
          onInstructionsToggle(true)
          voiceController.speak('Instructions opened')
          break
        case 'close help':
          onInstructionsToggle(false)
          voiceController.speak('Instructions closed')
          break
        case 'kit:drums':
        case 'kit:drum':
          onKitChange('drums')
          store.setCurrentKit('drums')
          voiceController.speak('Switched to drums')
          break
        case 'kit:piano':
          onKitChange('piano')
          store.setCurrentKit('piano')
          voiceController.speak('Switched to piano')
          break
        case 'kit:synth':
        case 'kit:funk':
          onKitChange('synth')
          store.setCurrentKit('synth')
          voiceController.speak('Switched to synth')
          break
        default:
          console.log('Unknown command:', command)
      }
    }

    voiceController.onListeningChange = (listening: boolean) => {
      setIsListening(listening)
    }

    return () => {
      voiceController.onCommand = null
      voiceController.onListeningChange = null
    }
  }, [onKitChange, onRecordingChange, onInstructionsToggle, store])

  const handleManualCommand = (command: string) => {
    const voiceController = VoiceController.getInstance()
    voiceController.processCommand(command)
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-2xl p-4 border border-white border-opacity-30 shadow-2xl">
        
        {/* Voice Status */}
        <div className="text-center mb-3">
          <div className={`text-sm font-medium ${isListening ? 'text-green-400' : 'text-gray-300'}`}>
            {isListening ? '🎤 Listening...' : '🎤 Voice Ready'}
          </div>
          {lastCommand && (
            <div className="text-xs text-blue-400 mt-1 font-mono">
              Last: "{lastCommand}"
            </div>
          )}
        </div>

        {/* Manual Controls (Fallback) */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button 
            className="px-3 py-1.5 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => handleManualCommand('record')}
          >
            Record
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => handleManualCommand('stop')}
          >
            Stop
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => handleManualCommand('clear')}
          >
            Clear
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 border border-blue-400 border-opacity-50 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => handleManualCommand('kit:drums')}
          >
            Drums
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 border border-blue-400 border-opacity-50 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => handleManualCommand('kit:piano')}
          >
            Piano
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 border border-blue-400 border-opacity-50 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => handleManualCommand('kit:synth')}
          >
            Synth
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg bg-green-500 bg-opacity-30 hover:bg-opacity-50 border border-green-400 border-opacity-50 text-white text-xs font-medium transition-all backdrop-blur-sm"
            onClick={() => onInstructionsToggle(true)}
          >
            Help
          </button>
        </div>
        
      </div>
    </div>
  )
}

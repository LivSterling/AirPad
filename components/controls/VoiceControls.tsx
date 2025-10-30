import React, { useEffect, useState } from 'react'
import { VoiceController } from '@/lib/voice/VoiceController'
import { KitType } from '@/types/audio'

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

  useEffect(() => {
    const voiceController = VoiceController.getInstance()
    
    // Set up voice command callbacks
    voiceController.onCommand = (command: string) => {
      setLastCommand(command)
      
      // Handle different commands
      switch (command) {
        case 'record':
          onRecordingChange(true)
          break
        case 'stop':
          onRecordingChange(false)
          break
        case 'kit:drums':
        case 'kit:drum':
          onKitChange('drums')
          break
        case 'kit:piano':
          onKitChange('piano')
          break
        case 'kit:synth':
        case 'kit:funk':
          onKitChange('synth')
          break
        case 'clear':
          // Handle clear command
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
  }, [onKitChange, onRecordingChange, onInstructionsToggle])

  const handleManualCommand = (command: string) => {
    const voiceController = VoiceController.getInstance()
    voiceController.processCommand(command)
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg">
        
        {/* Voice Status */}
        <div className="text-center mb-4">
          <div className={`text-sm ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
            {isListening ? '🎤 Listening...' : '🎤 Voice Ready'}
          </div>
          {lastCommand && (
            <div className="text-xs text-blue-400 mt-1">
              Last: "{lastCommand}"
            </div>
          )}
        </div>

        {/* Manual Controls (Fallback) */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button 
            className="voice-button text-xs"
            onClick={() => handleManualCommand('record')}
          >
            Record
          </button>
          <button 
            className="voice-button text-xs"
            onClick={() => handleManualCommand('stop')}
          >
            Stop
          </button>
          <button 
            className="voice-button text-xs"
            onClick={() => handleManualCommand('clear')}
          >
            Clear
          </button>
          <button 
            className="voice-button text-xs"
            onClick={() => handleManualCommand('kit:drums')}
          >
            Drums
          </button>
          <button 
            className="voice-button text-xs"
            onClick={() => handleManualCommand('kit:piano')}
          >
            Piano
          </button>
          <button 
            className="voice-button text-xs"
            onClick={() => handleManualCommand('kit:synth')}
          >
            Synth
          </button>
          <button 
            className="voice-button text-xs"
            onClick={() => onInstructionsToggle(true)}
          >
            Help
          </button>
        </div>
        
      </div>
    </div>
  )
}

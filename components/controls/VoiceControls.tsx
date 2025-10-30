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

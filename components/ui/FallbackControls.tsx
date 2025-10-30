import React from 'react'
import type { KitType } from '@/types'

interface FallbackControlsProps {
  isRecording: boolean
  onRecord: () => void
  onStop: () => void
  onPlayAll: () => void
  onStopAll: () => void
  onKitChange: (kit: KitType) => void
  onClear: () => void
  currentKit: KitType
}

export default function FallbackControls({
  isRecording,
  onRecord,
  onStop,
  onPlayAll,
  onStopAll,
  onKitChange,
  onClear,
  currentKit,
}: FallbackControlsProps) {
  const kitOptions: KitType[] = ['drums', 'piano', 'synth']
  
  const getKitEmoji = (kit: KitType): string => {
    switch (kit) {
      case 'drums':
        return '🥁'
      case 'piano':
        return '🎹'
      case 'synth':
        return '🎛️'
    }
  }

  const baseButtonClass = 'px-3 py-2 rounded-lg font-medium text-sm transition-all border backdrop-blur-sm text-white'
  const primaryButtonClass = `${baseButtonClass} bg-blue-500 bg-opacity-60 hover:bg-opacity-80 border-blue-400 border-opacity-50`
  const secondaryButtonClass = `${baseButtonClass} bg-white bg-opacity-10 hover:bg-opacity-20 border-white border-opacity-30`

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 bg-black bg-opacity-70 backdrop-blur-xl rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl max-w-4xl">
      {/* Title */}
      <p className="text-center text-gray-300 text-xs font-semibold mb-4 uppercase tracking-wide">Manual Controls (Fallback)</p>
      
      <div className="space-y-3">
        {/* Recording Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={onRecord}
            disabled={isRecording}
            className={`${isRecording ? 'bg-red-600 bg-opacity-80 border-red-500 cursor-default' : primaryButtonClass} ${isRecording ? '!' : ''}`}
            title="Start recording (Voice: 'record')"
          >
            🔴 {isRecording ? 'Recording...' : 'Record'}
          </button>
          
          <button
            onClick={onStop}
            disabled={!isRecording}
            className={`${!isRecording ? 'opacity-50 cursor-not-allowed' : primaryButtonClass}`}
            title="Stop recording (Voice: 'stop')"
          >
            ⏹️ Stop
          </button>
          
          <button
            onClick={onClear}
            className={secondaryButtonClass}
            title="Clear recording (Voice: 'clear')"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={onPlayAll}
            className={primaryButtonClass}
            title="Play all saved loops (Voice: 'play all')"
          >
            ▶️ Play All
          </button>
          
          <button
            onClick={onStopAll}
            className={secondaryButtonClass}
            title="Stop all playback (Voice: 'stop all')"
          >
            ⏸️ Stop All
          </button>
        </div>

        {/* Kit Selection */}
        <div className="flex gap-2 justify-center flex-wrap">
          {kitOptions.map((kit) => (
            <button
              key={kit}
              onClick={() => onKitChange(kit)}
              className={`${
                currentKit === kit
                  ? `${primaryButtonClass} ring-2 ring-offset-1 ring-offset-black ring-blue-300`
                  : secondaryButtonClass
              }`}
              title={`Switch to ${kit} kit (Voice: '${kit}')`}
            >
              {getKitEmoji(kit)} {kit.charAt(0).toUpperCase() + kit.slice(1)}
            </button>
          ))}
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-400 text-xs mt-3">
          💡 Tip: Use voice commands like "record", "play all", or say kit names for hands-free control
        </p>
      </div>
    </div>
  )
}

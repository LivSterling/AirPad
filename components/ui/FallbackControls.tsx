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
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black to-black/50 backdrop-blur-xl border-t border-white border-opacity-20 shadow-2xl py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <p className="text-center text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Controls (Voice: "help" for more)</p>
        
        <div className="flex flex-col gap-2">
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
        </div>
      </div>
    </div>
  )
}

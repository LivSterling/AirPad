import React from 'react'
import type { KitType } from '@/types'

interface StatusDisplayProps {
  isRecording: boolean
  currentKit: KitType
  savedLoopCount: number
  isPlaying: boolean
  recordingEventCount: number
}

export default function StatusDisplay({
  isRecording,
  currentKit,
  savedLoopCount,
  isPlaying,
  recordingEventCount,
}: StatusDisplayProps) {
  return (
    <div className="fixed top-4 right-4 z-30 space-y-2">
      {/* Recording Status */}
      {isRecording && (
        <div className="bg-red-500 bg-opacity-80 backdrop-blur-md rounded-lg px-4 py-2 border border-red-400 border-opacity-50 flex items-center gap-3 animate-pulse">
          <div className="w-3 h-3 bg-red-300 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-semibold">Recording</span>
          {recordingEventCount > 0 && (
            <span className="text-red-200 text-xs bg-black bg-opacity-40 px-2 py-1 rounded">
              {recordingEventCount} events
            </span>
          )}
        </div>
      )}

      {/* Playback Status */}
      {isPlaying && (
        <div className="bg-green-500 bg-opacity-80 backdrop-blur-md rounded-lg px-4 py-2 border border-green-400 border-opacity-50 flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-3 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-3 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-white text-sm font-semibold">Playing</span>
        </div>
      )}

      {/* Loop Counter */}
      {savedLoopCount > 0 && (
        <div className="bg-blue-500 bg-opacity-70 backdrop-blur-md rounded-lg px-4 py-2 border border-blue-400 border-opacity-50 flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="text-white text-sm font-semibold">{savedLoopCount} Loop{savedLoopCount !== 1 ? 's' : ''}</p>
            <p className="text-blue-200 text-xs">Saved</p>
          </div>
        </div>
      )}

      {/* Kit Display */}
      <div className="bg-purple-500 bg-opacity-70 backdrop-blur-md rounded-lg px-4 py-2 border border-purple-400 border-opacity-50 flex items-center gap-3">
        <span className="text-xl">
          {currentKit === 'drums' && '🥁'}
          {currentKit === 'piano' && '🎹'}
          {currentKit === 'synth' && '🎛️'}
        </span>
        <div>
          <p className="text-white text-sm font-semibold capitalize">{currentKit} Kit</p>
          <p className="text-purple-200 text-xs">Active</p>
        </div>
      </div>
    </div>
  )
}

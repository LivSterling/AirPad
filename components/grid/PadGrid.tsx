import React, { useEffect, useState } from 'react'
import Pad from './Pad'
import { HandTracker } from '@/lib/tracking/HandTracker'
import { AudioEngine } from '@/lib/audio/AudioEngine'
import { KitType, PadIndex } from '@/types/audio'

interface PadGridProps {
  currentKit: KitType
  isRecording: boolean
}

export default function PadGrid({ currentKit, isRecording }: PadGridProps) {
  const [activePad, setActivePad] = useState<number | null>(null)
  const [triggeredPad, setTriggeredPad] = useState<number | null>(null)

  useEffect(() => {
    const handTracker = HandTracker.getInstance()
    const audioEngine = AudioEngine.getInstance()

    // Set up hand tracking callbacks
    handTracker.onPinchDetected = (padIndex: number) => {
      // Validate and cast to PadIndex
      if (padIndex >= 0 && padIndex <= 8) {
        // Trigger sound
        audioEngine.triggerPad(padIndex as PadIndex, currentKit)
        
        // Visual feedback
        setTriggeredPad(padIndex)
        setTimeout(() => setTriggeredPad(null), 300)
      }
    }

    handTracker.onHover = (padIndex: number | null) => {
      setActivePad(padIndex)
    }

    return () => {
      // Cleanup
      handTracker.onPinchDetected = null
      handTracker.onHover = null
    }
  }, [currentKit, isRecording])

  // Create 9 pads (3x3 grid)
  const pads = Array.from({ length: 9 }, (_, index) => (
    <Pad
      key={index}
      index={index as PadIndex}
      isActive={activePad === index}
      isTriggered={triggeredPad === index}
      kitType={currentKit}
    />
  ))

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* 3x3 Pad Grid - Large and centered */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-4xl aspect-square p-8">
        {pads}
      </div>
    </div>
  )
}

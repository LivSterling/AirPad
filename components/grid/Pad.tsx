import React from 'react'
import { PadIndex, KitType } from '@/types/audio'
import { getKitConfig } from '@/lib/utils/helpers'

interface PadProps {
  index: PadIndex
  isActive: boolean
  isTriggered: boolean
  kitType: KitType
}

export default function Pad({ index, isActive, isTriggered, kitType }: PadProps) {
  // Get labels dynamically from kit configuration to ensure consistency
  const label = getKitConfig(kitType).labels[index]
  
  const getClasses = () => {
    // Base: transparent with visible border
    let classes = 'w-full h-full flex items-center justify-center rounded-2xl transition-all duration-100 backdrop-blur-sm relative overflow-hidden'
    
    if (isTriggered) {
      // Triggered: bright glow effect with scale animation
      classes += ' bg-blue-500 bg-opacity-80 border-4 border-blue-200 shadow-[0_0_40px_rgba(59,130,246,1)] scale-90 animate-pulse'
    } else if (isActive) {
      // Hovering: subtle highlight with glow
      classes += ' bg-white bg-opacity-25 border-4 border-white border-opacity-70 shadow-[0_0_25px_rgba(255,255,255,0.6)]'
    } else {
      // Default: transparent with visible border
      classes += ' bg-white bg-opacity-5 border-3 border-white border-opacity-40 hover:bg-white hover:bg-opacity-10 hover:border-opacity-60'
    }
    
    return classes
  }

  const getLabelClasses = () => {
    let classes = 'select-none font-bold drop-shadow-lg transition-all duration-100'
    
    if (isTriggered) {
      classes += ' text-white text-2xl'
    } else if (isActive) {
      classes += ' text-white text-lg'
    } else {
      classes += ' text-white text-opacity-80 text-base'
    }
    
    return classes
  }

  return (
    <div 
      className={getClasses()}
      data-pad-index={index}
      data-kit-type={kitType}
    >
      {/* Ripple effect on trigger */}
      {isTriggered && (
        <div className="absolute inset-0 bg-blue-300 opacity-30 animate-ping rounded-2xl" />
      )}
      
      <span className={getLabelClasses()}>{label}</span>
      
      {/* Corner indicator showing pad number */}
      <span className="absolute top-2 right-2 text-xs text-white text-opacity-50 font-mono">
        {index + 1}
      </span>
    </div>
  )
}

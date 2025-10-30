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
    let classes = 'w-full h-full flex items-center justify-center rounded-2xl transition-all duration-200 backdrop-blur-sm relative'
    
    if (isTriggered) {
      // Triggered: bright glow effect
      classes += ' bg-blue-500 bg-opacity-70 border-4 border-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-95'
    } else if (isActive) {
      // Hovering: subtle highlight
      classes += ' bg-white bg-opacity-20 border-4 border-white border-opacity-60 shadow-[0_0_20px_rgba(255,255,255,0.5)]'
    } else {
      // Default: transparent with visible border
      classes += ' bg-white bg-opacity-5 border-3 border-white border-opacity-40'
    }
    
    return classes
  }

  const getLabelClasses = () => {
    let classes = 'select-none font-bold text-lg drop-shadow-lg'
    
    if (isTriggered) {
      classes += ' text-white text-2xl'
    } else if (isActive) {
      classes += ' text-white'
    } else {
      classes += ' text-white text-opacity-80'
    }
    
    return classes
  }

  return (
    <div 
      className={getClasses()}
      data-pad-index={index}
      data-kit-type={kitType}
    >
      <span className={getLabelClasses()}>{label}</span>
      
      {/* Corner indicator showing pad number */}
      <span className="absolute top-2 right-2 text-xs text-white text-opacity-50 font-mono">
        {index + 1}
      </span>
    </div>
  )
}

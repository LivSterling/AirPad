import Head from 'next/head'
import { useEffect, useState } from 'react'
import PadGrid from '@/components/grid/PadGrid'
import VoiceControls from '@/components/controls/VoiceControls'
import InstructionsOverlay from '@/components/ui/InstructionsOverlay'
import { AudioEngine } from '@/lib/audio/AudioEngine'
import { HandTracker } from '@/lib/tracking/HandTracker'
import { VoiceController } from '@/lib/voice/VoiceController'
import { AudioStoreConnector } from '@/lib/integration/AudioStoreConnector'
import type { KitType } from '@/types'

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [currentKit, setCurrentKit] = useState<KitType>('drums')
  const [isRecording, setIsRecording] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Initialize AudioStoreConnector on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Setting up AudioStoreConnector...')
      AudioStoreConnector.getInstance().initialize()
    }
  }, [])

  const handleStart = async () => {
    setIsInitializing(true)
    setInitError(null)

    try {
      // Initialize audio engine (requires user gesture)
      console.log('Initializing AudioEngine...')
      await AudioEngine.getInstance().initialize()
      
      // Initialize hand tracking
      console.log('Initializing HandTracker...')
      await HandTracker.getInstance().initialize()
      
      // Initialize voice controller
      console.log('Initializing VoiceController...')
      await VoiceController.getInstance().initialize()
      
      console.log('All systems initialized successfully!')
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setInitError(error instanceof Error ? error.message : 'Initialization failed')
      setIsInitializing(false)
    }
  }

  // Render video and canvas elements
  const renderVideoElements = () => (
    <>
      {/* Camera feed as background - now visible! */}
      <video
        id="webcam"
        className="fixed top-0 left-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        style={{ 
          transform: 'scaleX(-1)',
          zIndex: -100
        }}
      />
      
      {/* Canvas for MediaPipe visualization (hidden) */}
      <canvas
        id="output_canvas"
        className="hidden"
        width="640"
        height="480"
      />
    </>
  )

  if (!isInitialized) {
    return (
      <>
        <Head>
          <title>AirPad MVP - Hands-Free Air Instrument</title>
          <meta name="description" content="Hands-free air instrument with voice commands and gesture control" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        {/* Render video elements even before initialization */}
        {renderVideoElements()}
        
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent', position: 'relative', zIndex: 1 }}>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">🎵 AirPad</h1>
            <p className="text-gray-300 mb-8">Hands-free air instrument</p>
            
            {!isInitializing && !initError && (
              <>
                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg shadow-lg transition-colors"
                >
                  Click to Start
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Camera and microphone permissions required
                </p>
              </>
            )}
            
            {isInitializing && (
              <div className="text-white text-xl">
                <div className="animate-pulse">Initializing systems...</div>
                <p className="text-gray-400 text-sm mt-4">
                  This may take a few moments
                </p>
              </div>
            )}
            
            {initError && (
              <div className="text-red-400 max-w-md mx-auto">
                <p className="text-xl mb-4">⚠️ Initialization Failed</p>
                <p className="text-sm mb-4">{initError}</p>
                <button
                  onClick={handleStart}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>AirPad MVP - Hands-Free Air Instrument</title>
        <meta name="description" content="Hands-free air instrument with voice commands and gesture control" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Render video elements FIRST, outside main */}
      {renderVideoElements()}

      <main className="min-h-screen relative overflow-hidden" style={{ background: 'transparent' }}>
        {/* Dark overlay to make UI elements visible over camera */}
        <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none" style={{ zIndex: -50 }} />
        
        {/* Compact Header */}
        <header className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">AirPad</h1>
          <div className="text-sm bg-black bg-opacity-50 text-white px-4 py-1 rounded-full backdrop-blur-sm">
            <span className="capitalize">{currentKit}</span>
            {isRecording && <span className="ml-3 text-red-400">● REC</span>}
          </div>
        </header>

        {/* Subtle instruction hint */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <p className="text-white text-sm drop-shadow-lg bg-black bg-opacity-40 px-4 py-2 rounded-full backdrop-blur-sm">
            👋 Position your hand and pinch to play
          </p>
        </div>

        {/* Main Pad Grid - Takes up most of screen */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <PadGrid 
            currentKit={currentKit}
            isRecording={isRecording}
          />
        </div>

        {/* Voice Controls UI */}
        <VoiceControls 
          onKitChange={setCurrentKit}
          onRecordingChange={setIsRecording}
          onInstructionsToggle={setShowInstructions}
        />

        {/* Instructions Overlay */}
        {showInstructions && (
          <InstructionsOverlay onClose={() => setShowInstructions(false)} />
        )}
      </main>
    </>
  )
}

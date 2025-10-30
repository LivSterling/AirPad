import React from 'react'

interface InstructionsOverlayProps {
  onClose: () => void
}

export default function InstructionsOverlay({ onClose }: InstructionsOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-black bg-opacity-70 backdrop-blur-xl rounded-2xl p-8 max-w-2xl mx-4 border border-white border-opacity-20 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">AirPad Instructions</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          
          {/* Hand Gestures */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Hand Gestures</h3>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Pinch:</strong> Touch index finger and thumb together over a pad to trigger sound</li>
              <li>• <strong>Hover:</strong> Move hand over pad to see preview (blue highlight)</li>
              <li>• <strong>Cooldown:</strong> 220ms between triggers to prevent accidental repeats</li>
            </ul>
          </section>

          {/* Voice Commands */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Voice Commands</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-400">Recording</h4>
                <ul className="space-y-1">
                  <li>• "record" - Start recording</li>
                  <li>• "stop" - Stop recording</li>
                  <li>• "clear" - Clear current take</li>
                  <li>• "save loop" - Save to stack</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-400">Playback</h4>
                <ul className="space-y-1">
                  <li>• "play all" - Play all saved loops</li>
                  <li>• "stop all" - Stop all playback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-400">Kits</h4>
                <ul className="space-y-1">
                  <li>• "drum kit" - Switch to drums</li>
                  <li>• "piano kit" - Switch to piano</li>
                  <li>• "funk kit" - Switch to synth</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-400">Help</h4>
                <ul className="space-y-1">
                  <li>• "open instructions" - Show this help</li>
                  <li>• "close instructions" - Hide this help</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Tips</h3>
            <ul className="space-y-1 text-sm">
              <li>• Ensure good lighting for hand tracking</li>
              <li>• Keep hands visible in camera frame</li>
              <li>• Speak clearly for voice commands</li>
              <li>• Use fallback buttons if voice isn't working</li>
            </ul>
          </section>

        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-blue-500 bg-opacity-50 hover:bg-opacity-70 border border-blue-400 border-opacity-50 text-white font-medium transition-all backdrop-blur-sm"
          >
            Got it!
          </button>
        </div>

      </div>
    </div>
  )
}

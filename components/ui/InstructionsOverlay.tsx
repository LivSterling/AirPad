import React from 'react'

interface InstructionsOverlayProps {
  onClose: () => void
}

export default function InstructionsOverlay({ onClose }: InstructionsOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-black bg-opacity-70 backdrop-blur-xl rounded-2xl p-8 max-w-3xl mx-4 border border-white border-opacity-20 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">🎵 AirPad Instructions</h2>
            <p className="text-gray-400 text-sm mt-1">Hand-free air drum machine with voice control</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-light w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:bg-opacity-10 transition"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          
          {/* Hand Gestures */}
          <section className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">👋 Hand Gestures</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">🤌</span>
                <span><strong>Pinch:</strong> Touch index finger and thumb together over a pad to trigger sound</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">👁️</span>
                <span><strong>Hover:</strong> Move hand over pad to see preview (white highlight)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">⏱️</span>
                <span><strong>Cooldown:</strong> 220ms between triggers to prevent accidental repeats</span>
              </li>
            </ul>
          </section>

          {/* Voice Commands */}
          <section className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">🎤 Voice Commands</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white bg-opacity-3 p-3 rounded border border-blue-400 border-opacity-30">
                <h4 className="font-medium text-blue-400 mb-2">🔴 Recording</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"record"</code> Start</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"stop"</code> Stop</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"clear"</code> Clear take</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"save loop"</code> Save</li>
                </ul>
              </div>
              <div className="bg-white bg-opacity-3 p-3 rounded border border-green-400 border-opacity-30">
                <h4 className="font-medium text-green-400 mb-2">▶️ Playback</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"play all"</code> Play</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"stop all"</code> Stop</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"clear all"</code> Clear all loops</li>
                </ul>
              </div>
              <div className="bg-white bg-opacity-3 p-3 rounded border border-purple-400 border-opacity-30">
                <h4 className="font-medium text-purple-400 mb-2">🎛️ Kits</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"drums"</code> Drum Kit</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"piano"</code> Piano Keys</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"synth"</code> Synth</li>
                </ul>
              </div>
              <div className="bg-white bg-opacity-3 p-3 rounded border border-cyan-400 border-opacity-30">
                <h4 className="font-medium text-cyan-400 mb-2">❓ Help</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"help"</code> Show this</li>
                  <li>• <code className="bg-black bg-opacity-50 px-1 rounded">"close"</code> Hide this</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">💡 Tips for Best Results</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span>💡</span>
                <span>Ensure <strong>good lighting</strong> for accurate hand tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span>📹</span>
                <span>Keep hands <strong>visible in camera frame</strong> during performance</span>
              </li>
              <li className="flex items-start gap-3">
                <span>🎤</span>
                <span><strong>Speak clearly</strong> and at normal volume for voice commands</span>
              </li>
              <li className="flex items-start gap-3">
                <span>🖱️</span>
                <span>Use <strong>fallback buttons</strong> at the bottom if voice isn't working</span>
              </li>
            </ul>
          </section>

          {/* Quick Reference */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-opacity-20 rounded-lg p-4 border border-blue-400 border-opacity-30">
            <p className="text-sm text-gray-300">
              <strong>Quick Start:</strong> Pinch pads with your hand or use voice commands to create loops and beats. Record, save, and layer loops for complex arrangements!
            </p>
          </div>

        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-blue-500 bg-opacity-50 hover:bg-opacity-70 border border-blue-400 border-opacity-50 text-white font-medium transition-all backdrop-blur-sm"
          >
            Got it! 🚀
          </button>
        </div>

      </div>
    </div>
  )
}

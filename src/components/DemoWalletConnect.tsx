'use client'

import { useState } from 'react'

export default function DemoWalletConnect() {
  const [demoConnected, setDemoConnected] = useState(false)
  const demoAccountId = '0.0.123456'

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-yellow-300">
      <h3 className="text-lg font-semibold mb-4 text-yellow-900">Demo Wallet (Testing)</h3>
      
      {!demoConnected ? (
        <div className="space-y-4">
          <p className="text-gray-700">Test the wallet connection flow without HashPack</p>
          <button
            onClick={() => setDemoConnected(true)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Connect Demo Wallet
          </button>
          <p className="text-sm text-yellow-800">
            This is for testing purposes only. Install HashPack for real functionality.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <span className="font-medium">Demo Connected:</span> {demoAccountId}
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              Network: testnet (demo)
            </p>
          </div>
          <button
            onClick={() => setDemoConnected(false)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Disconnect Demo Wallet
          </button>
        </div>
      )}
    </div>
  )
}
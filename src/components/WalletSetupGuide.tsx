'use client'

import { useState } from 'react'

export default function WalletSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-blue-900">Need help setting up your wallet?</span>
        </div>
        <svg className={`w-5 h-5 text-blue-600 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 text-sm text-blue-800">
          <div className="bg-white rounded-md p-4">
            <h4 className="font-semibold mb-2">Step 1: Install HashPack</h4>
            <p className="mb-2">HashPack is the recommended wallet for Hedera network.</p>
            <a
              href="https://www.hashpack.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
            >
              Download HashPack →
            </a>
          </div>

          <div className="bg-white rounded-md p-4">
            <h4 className="font-semibold mb-2">Step 2: Create or Import Account</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Open HashPack extension</li>
              <li>Create a new account or import existing one</li>
              <li>Secure your recovery phrase</li>
            </ul>
          </div>

          <div className="bg-white rounded-md p-4">
            <h4 className="font-semibold mb-2">Step 3: Get Testnet HBAR</h4>
            <p className="mb-2">For testing, you'll need testnet HBAR tokens.</p>
            <a
              href="https://portal.hedera.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
            >
              Get Testnet HBAR →
            </a>
          </div>

          <div className="bg-white rounded-md p-4">
            <h4 className="font-semibold mb-2">Step 4: Connect to HiveMind</h4>
            <p>Click "Connect Wallet" and approve the connection in HashPack.</p>
          </div>
        </div>
      )}
    </div>
  )
}
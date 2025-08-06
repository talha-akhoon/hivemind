'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'

export default function WalletStatusIndicator() {
  const { isConnected, accountId, isConnecting, connect: connectWallet, disconnect: disconnectWallet } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  console.log('accountId', accountId)
  if (!isConnected || !accountId) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <span>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="hidden sm:inline">Wallet Connected</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Wallet Connected</p>
                <p className="text-xs text-gray-500">HashPack</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-gray-500">Account ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">{accountId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Network</p>
                <p className="text-sm text-gray-900 capitalize">{process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                disconnectWallet()
                setShowDropdown(false)
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
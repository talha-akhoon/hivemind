'use client'

import { useWallet } from '@/contexts/WalletContext'

export default function WalletConnect() {
  const { accountId, isConnected, connecting, error, connectWallet, disconnectWallet, clearError } = useWallet()

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hedera Wallet</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex justify-between items-start">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-700">Connect your Hedera wallet to access the marketplace</p>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect HashPack Wallet'}
          </button>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Don't have HashPack? <a href="https://www.hashpack.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Download here</a>
            </p>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-xs">
                <strong>Note:</strong> Make sure HashPack extension is installed and unlocked before connecting.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-900">
              <span className="font-medium">Connected:</span> {accountId}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Network: {process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}
            </p>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}
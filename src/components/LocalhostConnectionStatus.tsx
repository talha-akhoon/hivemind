'use client'

import { useWallet } from '@/contexts/WalletContext'

export default function LocalhostConnectionStatus() {
  const { 
    isConnected, 
    connectionMethod, 
    isLocalhost, 
    isDevelopmentMode, 
    isMockMode,
    accountId,
    enableMockMode,
    disableMockMode
  } = useWallet()

  // Only show on localhost/development
  if (!isLocalhost && !isDevelopmentMode) return null

  const getConnectionMethodDisplay = () => {
    switch (connectionMethod) {
      case 'direct':
        return { label: 'Direct Extension', color: 'green', icon: '🔗' }
      case 'postmessage':
        return { label: 'PostMessage Bridge', color: 'blue', icon: '📨' }
      case 'contentscript':
        return { label: 'Content Script', color: 'purple', icon: '📜' }
      case 'mock':
        return { label: 'Mock Wallet', color: 'orange', icon: '🧪' }
      default:
        return { label: 'Not Connected', color: 'gray', icon: '❌' }
    }
  }

  const methodInfo = getConnectionMethodDisplay()

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">🏠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-900">
              Localhost Development Mode
            </h3>
            <p className="text-xs text-yellow-700">
              Enhanced wallet connection for local development
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">{methodInfo.icon}</span>
            <span className={`text-xs font-medium text-${methodInfo.color}-700`}>
              {methodInfo.label}
            </span>
          </div>
          {isConnected && accountId && (
            <p className="text-xs text-gray-600 font-mono">
              {accountId}
            </p>
          )}
        </div>
      </div>

      {/* Development Controls */}
      <div className="mt-3 pt-3 border-t border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLocalhost ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-yellow-800">
                Localhost: {isLocalhost ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isDevelopmentMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-yellow-800">
                Dev Mode: {isDevelopmentMode ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={isMockMode ? disableMockMode : enableMockMode}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isMockMode
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isMockMode ? '🧪 Mock Active' : '🔧 Enable Mock'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Method Details */}
      {isConnected && (
        <div className="mt-2 p-2 bg-white rounded border border-yellow-200">
          <div className="text-xs text-gray-600">
            <strong>Connection Details:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Method: {methodInfo.label}</li>
              <li>• Account: {accountId}</li>
              <li>• Network: {process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}</li>
              {isMockMode && (
                <li>• Mode: Development Testing (Mock Data)</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
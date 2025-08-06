'use client'

import { useState } from 'react'

export default function WalletConnectionHelper() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  const openHashPack = () => {
    // Try to open HashPack extension popup
    try {
      // HashPack extension ID for Chrome
      const hashpackExtensionId = 'nkbihfbeogaeaoehlefnkodbefgpgknn'
      window.open(`chrome-extension://${hashpackExtensionId}/popup.html`, '_blank')
    } catch (error) {
      console.log('Could not open HashPack directly:', error)
      // Fallback - just refresh
      handleRefresh()
    }
  }

  const checkNetwork = () => {
    alert('Please ensure HashPack is set to Testnet:\n\n1. Open HashPack extension\n2. Click on network selector (top right)\n3. Select "Testnet"\n4. Try connecting again')
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Troubleshooting Steps</h4>
      <div className="space-y-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm text-blue-700 transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : '🔄 Refresh Page & Retry'}
        </button>
        
        <button
          onClick={openHashPack}
          className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded-md text-sm text-green-700 transition-colors"
        >
          🔓 Open HashPack Extension
        </button>
        
        <button
          onClick={checkNetwork}
          className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-md text-sm text-purple-700 transition-colors"
        >
          🌐 Check Network Settings
        </button>
        
        <div className="px-3 py-2 bg-yellow-50 rounded-md text-sm text-yellow-700">
          💡 Ensure HashPack is unlocked and set to <strong>Testnet</strong>
        </div>
        
        <div className="px-3 py-2 bg-gray-100 rounded-md text-xs text-gray-600">
          <strong>Still having issues?</strong><br/>
          1. Disable other wallet extensions<br/>
          2. Clear browser cache<br/>
          3. Try in incognito mode
        </div>
      </div>
    </div>
  )
}
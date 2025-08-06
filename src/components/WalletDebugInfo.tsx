'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'

export default function WalletDebugInfo() {
  const { 
    isConnected, 
    accountId, 
    error, 
    connectionMethod, 
    isLocalhost, 
    isDevelopmentMode, 
    isMockMode 
  } = useWallet()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const checkWalletEnvironment = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK,
        hashpackInjected: !!(window as any).hashpack,
        chromeExtensions: !!(window as any).chrome?.runtime,
      }

      // Using direct HashPack integration
      info.integrationMethod = 'Direct HashPack'

      // Check for HashPack specific objects
      if ((window as any).hashpack) {
        const hashpack = (window as any).hashpack
        info.hashpackMethods = Object.keys(hashpack)
        info.hashpackVersion = hashpack.version
      }

      setDebugInfo(info)
    }

    checkWalletEnvironment()
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        Show Debug Info
      </button>
    )
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-900">Wallet Debug Information</h4>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-gray-700">
        <div><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</div>
        <div><strong>Account ID:</strong> {accountId || 'None'}</div>
        <div><strong>Connection Method:</strong> {connectionMethod || 'None'}</div>
        <div><strong>Mock Mode:</strong> {isMockMode ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        <div><strong>Network:</strong> {debugInfo.network || 'Not set'}</div>
        <div><strong>Is Localhost:</strong> {isLocalhost ? 'Yes' : 'No'}</div>
        <div><strong>Development Mode:</strong> {isDevelopmentMode ? 'Yes' : 'No'}</div>
        <div><strong>HashPack Injected:</strong> {debugInfo.hashpackInjected ? 'Yes' : 'No'}</div>
        <div><strong>Integration Method:</strong> {debugInfo.integrationMethod}</div>
        
        {debugInfo.hashpackMethods && (
          <div><strong>HashPack Methods:</strong> {debugInfo.hashpackMethods.join(', ')}</div>
        )}
        
        <div className="mt-3 pt-2 border-t border-gray-300">
          <strong>Environment:</strong>
          <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'

export default function WalletTestButton() {
  const [testResult, setTestResult] = useState<string>('')
  const [testing, setTesting] = useState(false)

  const testHashPackConnection = async () => {
    setTesting(true)
    setTestResult('')
    
    try {
      console.log('Testing HashPack connection...')
      
      // Check if HashPack is available
      const hashpack = (window as any).hashpack
      
      if (!hashpack) {
        setTestResult('❌ HashPack not found. Please install HashPack extension.')
        return
      }
      
      console.log('HashPack found:', hashpack)
      console.log('Available methods:', Object.keys(hashpack))
      
      setTestResult(`✅ HashPack detected!\nMethods: ${Object.keys(hashpack).join(', ')}`)
      
      // Try to get account info if available
      if (typeof hashpack.getConnectedAccountIds === 'function') {
        try {
          const accounts = await hashpack.getConnectedAccountIds()
          setTestResult(prev => prev + `\nConnected accounts: ${accounts.length}`)
        } catch (error) {
          console.log('Could not get connected accounts:', error)
        }
      }
      
    } catch (error) {
      console.error('Test error:', error)
      setTestResult(`❌ Test failed: ${(error as Error).message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-900">Wallet Connection Test</h4>
        <button
          onClick={testHashPackConnection}
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test HashPack'}
        </button>
      </div>
      
      {testResult && (
        <div className="bg-white rounded-md p-3 text-sm">
          <pre className="whitespace-pre-wrap text-gray-800">{testResult}</pre>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'

export default function HashPackDetector() {
  const [status, setStatus] = useState<{
    detected: boolean
    loading: boolean
    error?: string
    details?: any
  }>({ detected: false, loading: true })

  useEffect(() => {
    const checkHashPack = async () => {
      setStatus({ detected: false, loading: true })
      
      try {
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // We're using direct HashPack integration, no need for HashConnect

        // Check for HashPack extension injection
        let attempts = 0
        const maxAttempts = 15
        let hashpackDetected = false
        
        while (attempts < maxAttempts && !hashpackDetected) {
          // Check multiple possible injection points
          const hashpack = (window as any).hashpack || 
                          (window as any).hashconnect ||
                          (window as any).HashPack
          
          if (hashpack) {
            hashpackDetected = true
            setStatus({
              detected: true,
              loading: false,
              details: {
                version: hashpack.version || 'Unknown',
                methods: Object.keys(hashpack).slice(0, 5) // Show first 5 methods
              }
            })
            return
          }
          
          attempts++
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        // If HashPack not detected, provide appropriate error message
        setStatus({
          detected: false,
          loading: false,
          error: 'HashPack extension not detected. Please install HashPack wallet extension and refresh the page.'
        })
        
      } catch (error) {
        setStatus({
          detected: false,
          loading: false,
          error: `Detection error: ${error}`
        })
      }
    }

    checkHashPack()
  }, [])

  if (status.loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-sm text-yellow-800">Detecting HashPack wallet...</span>
        </div>
      </div>
    )
  }

  if (status.detected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">HashPack Wallet Ready!</p>
            {status.details && (
              <p className="text-xs text-green-600">
                Version: {status.details.version} | Available methods: {status.details.methods.length}+
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-red-800">HashPack Not Available</p>
          <p className="text-xs text-red-600">{status.error}</p>
          <div className="mt-2">
            <a
              href="https://www.hashpack.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-500 underline"
            >
              Install HashPack Wallet →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
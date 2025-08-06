'use client'

import { useState } from 'react'

export default function WalletTroubleshooting() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="font-medium text-blue-900">Wallet Connection Issues?</h4>
        <span className="text-blue-700 text-lg">{isOpen ? '−' : '+'}</span>
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-3 text-sm text-blue-900">
          <div>
            <h5 className="font-medium mb-1 text-blue-900">HashPack Not Found:</h5>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Install HashPack extension from <a href="https://www.hashpack.app/" target="_blank" rel="noopener noreferrer" className="underline font-medium">hashpack.app</a></li>
              <li>Refresh the page after installation</li>
              <li>Make sure the extension is enabled</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1 text-blue-900">Connection Failed:</h5>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Unlock your HashPack wallet</li>
              <li>Make sure you have a Hedera account set up</li>
              <li>Try refreshing the page and connecting again</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-1 text-blue-900">Network Issues:</h5>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Currently using: {process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}</li>
              <li>Make sure your wallet is on the same network</li>
              <li>For testnet, get free HBAR from the <a href="https://portal.hedera.com/faucet" target="_blank" rel="noopener noreferrer" className="underline font-medium">Hedera faucet</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
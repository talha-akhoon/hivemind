"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { HashConnect } from 'hashconnect';
import type { DappMetadata, SessionData } from 'hashconnect/dist/types';
import type { HashConnectConnectionState } from 'hashconnect/dist/types';
import {AccountId} from "@hashgraph/sdk";

// Context type definitions
interface WalletContextType {
    // State
    isInitialized: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    accountId: string | null;
    network: string;

    // Methods
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendTransaction: (transaction: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

// Constants
const PROJECT_ID = process.env.NEXT_PUBLIC_HASHCONNECT_PROJECT_ID || '';
const NETWORK = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
const PERSIST_KEY = 'wallet_should_connect';

// App metadata
const APP_METADATA: DappMetadata = {
    name: "HBAR Marketplace",
    description: "A marketplace powered by HBAR on Hedera",
    icons: ["https://your-marketplace.com/icon.png"],
    url: typeof window !== 'undefined' ? window.location.origin : "https://your-marketplace.com",
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Core state
    const [hashConnect, setHashConnect] = useState<HashConnect | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [pairingData, setPairingData] = useState<SessionData | null>(null);

    // Initialize HashConnect
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let mounted = true;

        const init = async () => {
            try {
                console.log('Initializing HashConnect...');

                // Dynamic imports
                const [{ HashConnect }, { LedgerId }] = await Promise.all([
                    import('hashconnect'),
                    import('@hashgraph/sdk')
                ]);

                if (!mounted) return;

                const ledgerId = NETWORK === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
                const hc = new HashConnect(ledgerId, PROJECT_ID, APP_METADATA, true);

                // Set up event listeners
                hc.pairingEvent.on((data: SessionData) => {
                    console.log('Pairing event:', data);
                    if (data.accountIds && data.accountIds.length > 0) {
                        setPairingData(data);
                        setAccountId(data.accountIds[0]);
                        setIsConnected(true);
                        setIsConnecting(false);

                        // Save connection preference
                        localStorage.setItem(PERSIST_KEY, 'true');
                    }
                });

                hc.connectionStatusChangeEvent.on((status: HashConnectConnectionState) => {
                    console.log('Connection status:', status);

                    // Handle connection states
                    if (status === 'Connected') {
                        setIsConnected(true);
                    } else if (status === 'Disconnected') {
                        setIsConnected(false);
                        setAccountId(null);
                        setPairingData(null);
                    }
                });

                hc.disconnectionEvent.on(() => {
                    console.log('Disconnection event');
                    setIsConnected(false);
                    setAccountId(null);
                    setPairingData(null);
                });

                // Initialize
                await hc.init();

                if (!mounted) return;

                console.log('HashConnect initialized');
                setHashConnect(hc);
                setIsInitialized(true);

                // Check if we should auto-connect
                const shouldConnect = localStorage.getItem(PERSIST_KEY) === 'true';

                if (shouldConnect && hc.hcData?.savedPairings?.length > 0) {
                    console.log('Found saved pairings, restoring connection...');
                    const pairing = hc.hcData.savedPairings[0];
                    if (pairing.accountIds?.length > 0) {
                        setPairingData(pairing);
                        setAccountId(pairing.accountIds[0]);
                        setIsConnected(true);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize:', error);
                if (mounted) {
                    setIsInitialized(true); // Set to true even on error so UI doesn't hang
                }
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // Connect wallet
    const connect = useCallback(async () => {
        if (!hashConnect || !isInitialized) {
            throw new Error('HashConnect not initialized');
        }

        try {
            setIsConnecting(true);

            // Clear any existing connections first
            if (hashConnect.hcData?.savedPairings?.length > 0) {
                for (const pairing of hashConnect.hcData.savedPairings) {
                    if (pairing.topic) {
                        await hashConnect.disconnect(pairing.topic).catch(() => {});
                    }
                }
            }

            // Open pairing modal
            await hashConnect.openPairingModal();
        } catch (error) {
            console.error('Failed to connect:', error);
            setIsConnecting(false);
            throw error;
        }
    }, [hashConnect, isInitialized]);

    // Disconnect wallet
    const disconnect = useCallback(async () => {
        if (!hashConnect) return;

        try {
            console.log('Disconnecting wallet...');

            // Clear connection preference FIRST
            localStorage.removeItem(PERSIST_KEY);

            // Disconnect all pairings
            if (hashConnect.hcData?.savedPairings?.length > 0) {
                for (const pairing of hashConnect.hcData.savedPairings) {
                    if (pairing.topic) {
                        await hashConnect.disconnect(pairing.topic).catch(() => {});
                    }
                }
            }

            // Clear state
            setIsConnected(false);
            setAccountId(null);
            setPairingData(null);

            // Clear all WalletConnect data from storage
            if (typeof window !== 'undefined') {
                // Clear localStorage
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.match(/wallet|connect|wc@|hashconnect/i)) {
                        keys.push(key);
                    }
                }
                keys.forEach(key => localStorage.removeItem(key));

                // Clear IndexedDB
                if ('indexedDB' in window && indexedDB.databases) {
                    const dbs = await indexedDB.databases();
                    for (const db of dbs) {
                        if (db.name && db.name.match(/wallet|connect|wc/i)) {
                            indexedDB.deleteDatabase(db.name);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error during disconnect:', error);
        }
    }, [hashConnect]);

    // Send transaction
    const sendTransaction = useCallback(async (transaction: any): Promise<string> => {
        console.log('Sending transaction...');
        console.log('hashConnect:', hashConnect);
        console.log('accountId:', accountId);
        console.log('pairingData:', pairingData);

        // Fix the condition check - proper operator precedence
        if (!hashConnect || !accountId || !pairingData?.accountIds || pairingData.accountIds.length === 0) {
            throw new Error('Wallet not connected');
        }

        try {
            // Convert transaction to bytes if it's a Hedera SDK transaction
            let transactionBytes;
            if (transaction && typeof transaction.toBytes === 'function') {
                console.log('Converting Hedera SDK transaction to bytes...');
                // Freeze the transaction first if not already frozen
                // if (!transaction.isFrozen()) {
                //     transaction.freezeWith(null); // Use null client since we're signing with wallet
                // }
                transactionBytes = transaction.toBytes();
                console.log('Transaction converted to bytes, length:', transactionBytes.length);
            } else if (transaction instanceof Uint8Array) {
                console.log('Transaction is already bytes');
                transactionBytes = transaction;
            } else {
                console.log('Transaction type:', typeof transaction);
                console.log('Transaction:', transaction);
                throw new Error('Invalid transaction format. Expected Hedera SDK transaction or bytes.');
            }

            console.log('Calling hashConnect.sendTransaction with:', {
                accountId,
                transactionBytesLength: transactionBytes.length
            });

            const result = await hashConnect.sendTransaction(
                AccountId.fromString(accountId),
                transaction
            );

            console.log('Raw transaction result:', result);
            console.log('Result type:', typeof result);
            console.log('Result keys:', Object.keys(result || {}));

        } catch (error) {
            console.error('Transaction failed:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }, [hashConnect, accountId, pairingData]);

    const value: WalletContextType = {
        isInitialized,
        isConnected,
        isConnecting,
        accountId,
        network: NETWORK,
        connect,
        disconnect,
        sendTransaction,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
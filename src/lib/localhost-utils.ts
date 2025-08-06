/**
 * Utilities for handling localhost-specific wallet connections
 */

export interface LocalhostConfig {
  enableMockWallet: boolean
  debugMode: boolean
  connectionTimeout: number
  retryAttempts: number
  allowedOrigins: string[]
}

export const DEFAULT_LOCALHOST_CONFIG: LocalhostConfig = {
  enableMockWallet: true,
  debugMode: true,
  connectionTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  allowedOrigins: ['localhost', '127.0.0.1', '192.168.*', '*.local']
}

/**
 * Detects if the current environment is localhost
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local') ||
    hostname === '0.0.0.0'
  )
}

/**
 * Detects if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || isLocalhost()
}

/**
 * Creates a debug logger that only logs in development/localhost
 */
export const createDebugLogger = (prefix: string) => {
  const shouldLog = isDevelopment()
  
  return {
    log: (...args: any[]) => {
      if (shouldLog) console.log(`[${prefix}]`, ...args)
    },
    warn: (...args: any[]) => {
      if (shouldLog) console.warn(`[${prefix}]`, ...args)
    },
    error: (...args: any[]) => {
      if (shouldLog) console.error(`[${prefix}]`, ...args)
    },
    debug: (...args: any[]) => {
      if (shouldLog) console.debug(`[${prefix}]`, ...args)
    }
  }
}

/**
 * Gets localhost-specific configuration
 */
export const getLocalhostConfig = (): LocalhostConfig => {
  const config = { ...DEFAULT_LOCALHOST_CONFIG }
  
  // Override with environment variables if available
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_WALLET) {
    config.enableMockWallet = process.env.NEXT_PUBLIC_ENABLE_MOCK_WALLET === 'true'
  }
  
  if (process.env.NEXT_PUBLIC_WALLET_DEBUG_MODE) {
    config.debugMode = process.env.NEXT_PUBLIC_WALLET_DEBUG_MODE === 'true'
  }
  
  if (process.env.NEXT_PUBLIC_WALLET_CONNECTION_TIMEOUT) {
    config.connectionTimeout = parseInt(process.env.NEXT_PUBLIC_WALLET_CONNECTION_TIMEOUT, 10)
  }
  
  return config
}

/**
 * Validates if an origin is allowed for localhost connections
 */
export const isAllowedOrigin = (origin: string, config: LocalhostConfig = DEFAULT_LOCALHOST_CONFIG): boolean => {
  return config.allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*')
      return new RegExp(pattern).test(origin)
    }
    return origin === allowed
  })
}

/**
 * Creates a timeout promise for connection attempts
 */
export const createConnectionTimeout = (timeoutMs: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Connection timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  })
}

/**
 * Implements exponential backoff for retry attempts
 */
export const exponentialBackoff = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000) // Max 10 seconds
}

/**
 * Waits for a specified amount of time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Checks if HashPack extension is likely installed
 */
export const checkExtensionInstalled = (): boolean => {
  // Check for common extension indicators
  const indicators = [
    () => !!(window as any).hashpack,
    () => !!(window as any).hashconnect,
    () => !!(window as any).HashPack,
    () => document.querySelector('script[src*="hashpack"]'),
    () => document.querySelector('meta[name*="hashpack"]'),
    () => !!(window as any).chrome?.runtime
  ]
  
  return indicators.some(check => {
    try {
      return check()
    } catch {
      return false
    }
  })
}

/**
 * Gets browser and environment information for debugging
 */
export const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    hostname: window.location.hostname,
    origin: window.location.origin,
    protocol: window.location.protocol,
    isLocalhost: isLocalhost(),
    isDevelopment: isDevelopment(),
    hasChrome: !!(window as any).chrome,
    hasExtensionAPI: !!(window as any).chrome?.runtime,
    timestamp: new Date().toISOString()
  }
}
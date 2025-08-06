'use client'

import { useEffect, useState } from 'react'

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)
          `,
          animation: 'float 20s ease-in-out infinite'
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes particle-float {
          0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(100px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
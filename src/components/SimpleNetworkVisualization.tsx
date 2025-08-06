'use client'

import { useEffect, useRef } from 'react'

export default function SimpleNetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Network nodes
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    const nodeCount = 25

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      })
    }

    let time = 0

    const animate = () => {
      time += 0.01
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update node positions
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy
        
        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1
        
        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      })

      // Draw connections
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            const opacity = (150 - distance) / 150 * 0.3
            ctx.strokeStyle = `rgba(100, 100, 100, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = 'rgba(60, 60, 60, 0.8)'
      nodes.forEach(node => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-50"
      style={{ 
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  )
}
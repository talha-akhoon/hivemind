'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function NetworkVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const containerWidth = container.clientWidth || 800
    const containerHeight = container.clientHeight || 600

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerWidth / containerHeight,
      0.1,
      1000
    )
    camera.position.z = 20

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(containerWidth, containerHeight)
    renderer.setClearColor(0x000000, 0) // Transparent background
    container.appendChild(renderer.domElement)

    // Create network structure similar to the screenshot
    const nodes: THREE.Mesh[] = []
    const connections: THREE.Line[] = []
    const nodeCount = 30

    // Node material - small dots
    const nodeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    })

    // Line material - thin gray lines
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x666666,
      transparent: true,
      opacity: 0.4
    })

    // Create nodes in a more complex 3D structure
    const nodePositions: THREE.Vector3[] = []
    
    for (let i = 0; i < nodeCount; i++) {
      // Create a more complex geometric distribution
      const radius = 8 + Math.random() * 4
      const phi = Math.acos(-1 + (2 * i) / nodeCount) + (Math.random() - 0.5) * 0.5
      const theta = Math.sqrt(nodeCount * Math.PI) * phi + (Math.random() - 0.5) * 0.5
      
      const x = Math.cos(theta) * Math.sin(phi) * radius
      const y = Math.sin(theta) * Math.sin(phi) * radius
      const z = Math.cos(phi) * radius
      
      const nodeGeometry = new THREE.SphereGeometry(0.05, 6, 6)
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial)
      node.position.set(x, y, z)
      
      nodePositions.push(new THREE.Vector3(x, y, z))
      scene.add(node)
      nodes.push(node)
    }

    // Create a dense network of connections like in the screenshot
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const distance = nodePositions[i].distanceTo(nodePositions[j])
        
        // Connect nodes that are within a certain distance
        if (distance < 8) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            nodePositions[i],
            nodePositions[j]
          ])
          
          const line = new THREE.Line(geometry, lineMaterial)
          scene.add(line)
          connections.push(line)
        }
      }
    }

    // Animation variables
    let time = 0
    const originalPositions = nodePositions.map(pos => pos.clone())

    // Animation loop
    const animate = () => {
      time += 0.005

      // Subtle breathing animation
      nodes.forEach((node, index) => {
        const original = originalPositions[index]
        const breathe = Math.sin(time + index * 0.1) * 0.2
        
        node.position.x = original.x + breathe * 0.5
        node.position.y = original.y + breathe * 0.3
        node.position.z = original.z + breathe * 0.4
        
        nodePositions[index].copy(node.position)
      })

      // Update connection lines
      let connectionIndex = 0
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (connectionIndex < connections.length) {
            const line = connections[connectionIndex]
            const geometry = line.geometry as THREE.BufferGeometry
            const positions = geometry.attributes.position.array as Float32Array
            
            positions[0] = nodePositions[i].x
            positions[1] = nodePositions[i].y
            positions[2] = nodePositions[i].z
            positions[3] = nodePositions[j].x
            positions[4] = nodePositions[j].y
            positions[5] = nodePositions[j].z
            
            geometry.attributes.position.needsUpdate = true
            connectionIndex++
          }
        }
      }

      // Very slow rotation
      scene.rotation.y += 0.001
      scene.rotation.x += 0.0005

      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!container) return
      
      const newWidth = container.clientWidth || 800
      const newHeight = container.clientHeight || 600
      
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      
      // Dispose of Three.js objects
      nodes.forEach(node => {
        node.geometry.dispose()
        if (Array.isArray(node.material)) {
          node.material.forEach(material => material.dispose())
        } else {
          node.material.dispose()
        }
      })
      
      connections.forEach(line => {
        line.geometry.dispose()
        if (Array.isArray(line.material)) {
          line.material.forEach(material => material.dispose())
        } else {
          line.material.dispose()
        }
      })
      
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full opacity-30"
      style={{ zIndex: -1 }}
    />
  )
}
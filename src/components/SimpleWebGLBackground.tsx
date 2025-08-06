'use client'

import { useRef, useEffect, useState } from 'react'

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Create flowing patterns
    float wave1 = sin(uv.x * 10.0 + u_time * 0.5) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 8.0 + u_time * 0.3) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 6.0 + u_time * 0.7) * 0.5 + 0.5;
    
    // Combine waves
    float pattern = (wave1 + wave2 + wave3) / 3.0;
    
    // Create color gradient
    vec3 color1 = vec3(0.2, 0.4, 0.8); // Blue
    vec3 color2 = vec3(0.6, 0.2, 0.8); // Purple
    vec3 color3 = vec3(0.1, 0.6, 0.7); // Cyan
    
    vec3 finalColor = mix(color1, color2, pattern);
    finalColor = mix(finalColor, color3, sin(u_time * 0.2) * 0.3 + 0.3);
    
    gl_FragColor = vec4(finalColor * 0.3, 1.0);
  }
`

export default function SimpleWebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.log('WebGL not supported')
      return
    }

    // Create shader function
    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      
      return shader
    }

    // Create program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    // Set up geometry (full screen quad)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')

    // Resize function
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    window.addEventListener('resize', resize)
    resize()

    // Animation loop
    const startTime = Date.now()
    let animationId: number

    const render = () => {
      const time = (Date.now() - startTime) * 0.001

      gl.useProgram(program)
      
      // Set uniforms
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, time)

      // Set up attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [isClient])

  if (!isClient) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: -1, pointerEvents: 'none' }}
    />
  )
}
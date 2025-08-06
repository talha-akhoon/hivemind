'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import Link from "next/link";
import {useRouter} from "next/navigation";

interface WelcomePageProps {
  showDashboardButton?: boolean
}


// Network Globe Component
function NetworkGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()

  // Generate random points on sphere surface
  const { particles, connections } = useMemo(() => {
    const particles = []
    const connections = []
    const particleCount = 150
    const radius = 2.5

    // Generate particles
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      particles.push({ x, y, z, id: i })
    }

    // Generate connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.sqrt(
            Math.pow(particles[i].x - particles[j].x, 2) +
            Math.pow(particles[i].y - particles[j].y, 2) +
            Math.pow(particles[i].z - particles[j].z, 2)
        )

        if (dist < 0.8 && Math.random() > 0.85) {
          connections.push([particles[i], particles[j]])
        }
      }
    }

    return { particles, connections }
  }, [])

  // Animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.002
    }
    if (linesRef.current) {
      linesRef.current.rotation.y += 0.002
    }
  })

  const scale = viewport.width < 8 ? 0.6 : 0.8

  return (
      <group scale={scale}>
        {/* Core sphere */}
        <Sphere ref={meshRef as any} args={[2.48, 32, 32]}>
          <meshBasicMaterial
              color="#3b82f6"
              wireframe={true}
              transparent={true}
              opacity={0.05}
          />
        </Sphere>

        {/* Particles */}
        <group ref={particlesRef}>
          {particles.map((particle) => (
              <mesh key={particle.id} position={[particle.x, particle.y, particle.z]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color="#60a5fa" />
              </mesh>
          ))}
        </group>

        {/* Connections */}
        <group ref={linesRef}>
          {connections.map((connection, idx) => {
            const points = []
            points.push(new THREE.Vector3(connection[0].x, connection[0].y, connection[0].z))
            points.push(new THREE.Vector3(connection[1].x, connection[1].y, connection[1].z))
            const geometry = new THREE.BufferGeometry().setFromPoints(points)

            return (
                <primitive key={idx} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
                  color: '#3b82f6',
                  transparent: true,
                  opacity: 0.15
                }))} />
            )
          })}
        </group>
      </group>
  )
}

export default function HiveMindLanding({ showDashboardButton }: WelcomePageProps) {
  useEffect(() => {
    const handleScroll = () => {}
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const router = useRouter();
  const handleLogin = () => {
    router.push('/login')
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-xl font-bold text-gray-900">HiveMind</span>
              </div>

              {/* Center Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  About
                </a>
                <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  FAQ
                </a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Contact
                </a>
              </div>

              {/* Right Navigation */}
              <div className="flex items-center space-x-4">
                {showDashboardButton ? (
                    <Link
                        href='/home'
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                ) : (
                    <>
                      <button
                          onClick={handleLogin}
                          className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      >
                        Login
                      </button>
                    </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section with 3D Globe */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* 3D Globe Background */}
          <div className="absolute top-0 inset-0 flex ">
            <div style={{ width: '100%', height: '50vh' }}>
              <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <NetworkGlobe />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
              </Canvas>
            </div>
          </div>

          <div className="relative z-10 text-center pt-100">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HiveMind
            </span>
            </h1>

            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Breaking the AI compute monopoly by creating an open marketplace where anyone can
              purchase a global network of compute to train their models, cheaper and faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </button>
              <a
                  href="#faq"
                  className="text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border border-gray-300 hover:border-blue-300 transform hover:scale-105"
              >
                Learn More
              </a>
            </div>

            {/* Stats Cards - New Addition */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20 mb-20">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  10,000+
                </div>
                <p className="text-gray-600">Active GPUs</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  50ms
                </div>
                <p className="text-gray-600">Avg. Latency</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  99.9%
                </div>
                <p className="text-gray-600">Uptime</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">
                  70%
                </div>
                <p className="text-gray-600">Cost Savings</p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Compute Network</h3>
                <p className="text-gray-600">
                  Access GPU clusters worldwide for faster, more affordable AI model training
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Datasets</h3>
                <p className="text-gray-600">
                  Purchase high-quality training data to improve your model performance
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Decentralized Payments</h3>
                <p className="text-gray-600">
                  Secure, transparent transactions powered by Hedera blockchain technology
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About HiveMind</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're democratizing AI by breaking down the barriers to compute access
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="transform hover:scale-105 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">The Problem</h3>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
                  <p className="text-gray-700 mb-4">
                    AI compute resources are monopolized by big tech companies, making it expensive
                    and difficult for researchers, startups, and developers to train their models.
                  </p>
                  <p className="text-gray-700">
                    This creates barriers to innovation and limits who can participate in the AI revolution.
                  </p>
                </div>
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Solution</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <p className="text-gray-700 mb-4">
                    HiveMind creates an open marketplace where compute providers can offer their
                    resources and AI developers can access them at competitive prices.
                  </p>
                  <p className="text-gray-700">
                    Built on Hedera blockchain for transparent, secure, and efficient transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section - New Addition */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                HiveMinds connects idle compute resources with AI researchers through a transparent, secure blockchain marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1: Connect Wallet */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">Connect Wallet</h3>
                <p className="text-gray-600 text-center mb-4">Link your HashPack wallet to access the HiveMinds ecosystem securely</p>
                <div className="flex justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              {/* Step 2: Browse & Choose */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">Submit or Earn</h3>
                <p className="text-gray-600 text-center mb-4">Post ML training jobs or provide your compute resources to earn HBAR</p>
                <div className="flex justify-center">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Step 3: Deploy & Train */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">Automatic Matching</h3>
                <p className="text-gray-600 text-center mb-4">Our smart agents find and complete jobs autonomously using your compute power</p>
                <div className="flex justify-center">
                  <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Step 4: Monitor & Scale */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">Collect Rewards</h3>
                <p className="text-gray-600 text-center mb-4">Get paid automatically in HBAR when jobs complete successfully</p>
                <div className="flex justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M4.574 4.8l-1.44 1.44m18.332 18.332l-1.44-1.44m-16.892 0l-1.44 1.44M20.064 6.24l-1.44-1.44" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Additional explanation */}
            <div className="mt-16 bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-center">For Compute Providers</h3>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="prose prose-blue max-w-none">
                    <ol className="space-y-4">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">1</span>
                        <span><strong className="text-gray-900">Install hivemind-cli</strong> on your compute instance with a simple npm installation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">2</span>
                        <span><strong className="text-gray-900">Connect your wallet</strong> to securely receive payments for completed jobs</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">3</span>
                        <span><strong className="text-gray-900">Relax</strong> while our agents automatically find and complete jobs on the marketplace</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">4</span>
                        <span><strong className="text-gray-900">Earn HBAR</strong> automatically deposited to your wallet as jobs complete</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-6 text-center md:text-left">
                    <a
                      href="https://www.npmjs.com/package/hivemind-protocol-cli"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Get Started with hivemind-cli
                      <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-900 rounded-lg p-4 max-w-md w-full">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="text-xs text-gray-400 ml-2">Terminal</div>
                    </div>
                    <div className="font-mono text-sm text-green-400 bg-gray-900">
                      <p className="mb-1">$ npm install -g hivemind-protocol-cli</p>
                      <p className="mb-1">$ hivemind-cli init</p>
                      <p className="mb-1">{'>'} Enter your wallet address: 0x72f...</p>
                      <p className="mb-1">{'>'} Setting up compute agent...</p>
                      <p className="mb-1">{'>'} Connected to HiveMinds network!</p>
                      <p className="mb-1">{'>'} Finding jobs....</p>
                      <p className="text-blue-400">Agent running... sit back and earn!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="bg-gray-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How does HiveMind work?</h3>
                <p className="text-gray-700">
                  HiveMind connects compute providers with AI developers through a decentralized marketplace.
                  Providers list their GPU resources, developers browse and purchase compute time, and smart
                  contracts handle secure payments.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What blockchain does HiveMind use?</h3>
                <p className="text-gray-700">
                  We use Hedera Hashgraph for its fast, secure, and energy-efficient consensus mechanism.
                  This ensures quick transactions with minimal environmental impact.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I get started?</h3>
                <p className="text-gray-700">
                  Simply create an account, connect your Hedera wallet, and you can start browsing
                  available compute resources or list your own hardware for others to use.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What are the fees?</h3>
                <p className="text-gray-700">
                  HiveMind charges a small transaction fee of 2.5% to maintain the platform and ensure
                  smooth operations. All other costs go directly to compute providers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Docs Section */}
        <div id="docs" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h2>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to get started with HiveMind
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
                <p className="text-gray-600 text-sm">Get up and running in minutes</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">API Reference</h3>
                <p className="text-gray-600 text-sm">Complete API documentation</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutorials</h3>
                <p className="text-gray-600 text-sm">Step-by-step guides</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Examples</h3>
                <p className="text-gray-600 text-sm">Code samples and demos</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - New Addition */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Join the Revolution?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start training your AI models with the power of decentralized compute
            </p>
            <button
                onClick={handleLogin}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started for Free
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-xl font-bold">HiveMind</span>
              </div>

              <div className="flex space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>

              <div className="text-gray-400 mt-4 md:mt-0">
                © 2025 HiveMind. Breaking the AI compute monopoly.
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}


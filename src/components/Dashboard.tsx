'use client'

import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import Layout from '../app/(protected)/layout'
import {useAuth} from "@/contexts/AuthContext";

interface DashboardProps {
  onGoToHome?: () => void
}

type ActivePage = 'home' | 'datasets' | 'jobs' | 'profile'

export default function Dashboard({ onGoToHome }: DashboardProps) {
  return (
      <HomePage />
  );
}

// Home Page Component
function HomePage() {
  const { isConnected } = useWallet()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to HiveMind</h1>
        <p className="text-gray-600 mt-2">Your AI compute marketplace dashboard</p>
      </div>

      {/* Wallet Setup Guide - only show if not connected */}
      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Connect Your Wallet to Get Started</h3>
              <p className="text-blue-800 mb-4">
                To access the full HiveMind marketplace, you'll need to connect your Hedera wallet. 
                This enables secure transactions and access to compute resources.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>What you can do with a connected wallet:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Purchase compute time for AI model training</li>
                  <li>Buy and sell premium datasets</li>
                  <li>Submit and monitor training jobs</li>
                  <li>Earn rewards for providing compute resources</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Datasets</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900">$0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Models</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Start by creating your first job or dataset</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Datasets Page Component
function DatasetsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600 mt-2">Manage your training datasets</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          Upload Dataset
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <p className="text-gray-500">No datasets found</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first dataset to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Jobs Page Component
function JobsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compute Jobs</h1>
          <p className="text-gray-600 mt-2">Monitor your training jobs</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          Create Job
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-500">No jobs found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first compute job to start training</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Page Component
function ProfilePage({ user, accountId, isConnected }: { user: any, accountId: string | null, isConnected: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Status</label>
              <p className="mt-1 text-sm text-green-600">Active</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">January 2025</p>
            </div>
          </div>
        </div>

        {/* Wallet Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
            {isConnected && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Hedera Account ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{accountId}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Network</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
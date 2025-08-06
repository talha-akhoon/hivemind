'use client'

import { useAuth } from '@/contexts/AuthContext'
import HiveMindLanding from '@/components/WelcomePage'
import GlobeTest from '@/components/GlobeTest'
import {redirect} from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { user, loading } = useAuth()
    console.log(user)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  return <HiveMindLanding showDashboardButton={!!user}/>
}
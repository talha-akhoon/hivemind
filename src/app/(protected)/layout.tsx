import WalletStatusIndicator from '../../components/WalletStatusIndicator'
import UserDropdownMenu from '../../components/UserDropdownMenu'
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HiveMind</h1>
                <p className="text-xs text-gray-600">AI Compute Marketplace</p>
              </div>
            </div>
            {/* Navigation placeholder - implement as needed */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/home">
                <span className="text-gray-900 hover:text-blue-600 transition-colors">Home</span>
              </Link>
              <Link href='/datasets'>
                <span className="text-gray-900 hover:text-blue-600 transition-colors">Datasets</span>
              </Link>
              <Link href="/jobs">
                <span className="text-gray-900 hover:text-blue-600 transition-colors">Jobs</span>
              </Link>
              {/* Navigation buttons can be added here if needed globally */}
            </nav>
            {/* User Menu */}
            <WalletStatusIndicator />
            <UserDropdownMenu />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

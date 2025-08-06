import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function login() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium mb-4 inline-flex items-center"
                    >
                        ← Back to Home
                    </Link>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">H</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">HiveMind</h1>
                    </div>
                </div>

                <AuthForm
                    mode='login'
                />
            </div>
        </div>
    )
}
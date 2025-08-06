"use client";
import {signup} from "@/app/(auth)/register/actions";
import {login} from "@/app/(auth)/login/actions";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
    mode: 'login' | 'register'
}

export default function AuthForm({mode}: AuthFormProps) {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await signup(formData);
        setLoading(false);
        if (result.success) {
            setMessage("Registration successful! Please check your email to confirm your account.");
        } else {
            setError(result.error || "Registration failed.");
        }
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await login(formData);
        setLoading(false);
        if (result.success) {
            router.refresh(); // Refresh session and UI
        } else {
            setError(result.error || "Login failed.");
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </h2>

            {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

            <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {mode === 'register' && (
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>


            <div className="mt-6 text-center">
                <Link
                    href={mode === 'login' ? '/register' : '/login'}
                    className="text-blue-600 hover:text-blue-500 text-sm"
                >
                    {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </Link>
            </div>
        </div>
    )
}
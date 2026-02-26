'use client'

import { SignUp, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'user' | 'author'

export default function SignUpPage() {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<Role>('user')
    const [isSettingRole, setIsSettingRole] = useState(false)

    // Hydrate selectedRole from localStorage after mount (SSR-safe)
    useEffect(() => {
        const saved = localStorage.getItem('pendingRole') as Role | null
        if (saved === 'author' || saved === 'user') {
            setSelectedRole(saved)
        }
    }, [])

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return

        const existingRole = user.publicMetadata?.role as string | undefined

        // If role already set, redirect directly without calling set-role
        if (existingRole) {
            localStorage.removeItem('pendingRole')
            if (existingRole === 'author') {
                router.replace('/author/dashboard')
            } else if (existingRole === 'admin') {
                router.replace('/admin/dashboard')
            } else {
                router.replace('/user/dashboard')
            }
            return
        }

        // New user — set the role they selected before signup
        const assignRole = async () => {
            setIsSettingRole(true)
            try {
                const res = await fetch('/api/set-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: selectedRole }),
                })

                console.log('[SIGNUP] /api/set-role response status:', res.status)

                if (!res.ok) {
                    throw new Error('Failed to set role')
                }

                const data = await res.json()
                console.log('[SIGNUP] /api/set-role response data:', data)
                console.log('[SIGNUP] data.role value:', data.role)

                // Reload user to get fresh publicMetadata
                await user.reload()

                // Use role from API response — avoids stale selectedRole state
                localStorage.removeItem('pendingRole')
                if (data.role === 'author') {
                    console.log('[SIGNUP] Redirecting to /author/dashboard')
                    router.replace('/author/dashboard')
                } else if (data.role === 'admin') {
                    console.log('[SIGNUP] Redirecting to /admin/dashboard')
                    router.replace('/admin/dashboard')
                } else {
                    console.log('[SIGNUP] Redirecting to /user/dashboard')
                    router.replace('/user/dashboard')
                }
            } catch (err) {
                setIsSettingRole(false)
            }
        }

        assignRole()
    }, [isLoaded, isSignedIn, user]) // eslint-disable-line react-hooks/exhaustive-deps

    if (isSettingRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-300 text-sm font-medium">Setting up your account…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-3xl">📚</span>
                    <h1 className="text-2xl font-bold text-white tracking-tight">LibraryMS</h1>
                </div>
                <p className="text-slate-400 text-sm">Create your account to get started</p>
            </div>

            {/* Role Toggle Card */}
            <div className="w-full max-w-md mb-6">
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 text-center">
                        I want to join as
                    </p>
                    <div className="relative flex bg-slate-900/70 rounded-xl p-1 gap-1">
                        {/* Sliding indicator */}
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg bg-amber-500 shadow-lg transition-all duration-300 ease-in-out ${selectedRole === 'author' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                                }`}
                        />
                        <button
                            onClick={() => { setSelectedRole('user'); localStorage.setItem('pendingRole', 'user') }}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${selectedRole === 'user'
                                ? 'text-slate-900'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <span>📖</span>
                            Reader
                        </button>
                        <button
                            onClick={() => { setSelectedRole('author'); localStorage.setItem('pendingRole', 'author') }}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${selectedRole === 'author'
                                ? 'text-slate-900'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <span>✍️</span>
                            Author
                        </button>
                    </div>

                    {/* Role description */}
                    <p className="mt-3 text-center text-xs text-slate-500 min-h-[1.25rem] transition-all duration-200">
                        {selectedRole === 'user'
                            ? 'Browse, borrow, and review books in the library.'
                            : 'Publish and manage your own books in the library.'}
                    </p>
                </div>
            </div>

            {/* Clerk SignUp Component */}
            <div className="w-full max-w-md">
                <SignUp
                    routing="hash"
                    signInUrl="/sign-in"
                    forceRedirectUrl={`/sign-up?role=${selectedRole}`}
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-slate-800/60 backdrop-blur border border-slate-700/60 shadow-2xl rounded-2xl',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-slate-400',
                            socialButtonsBlockButton:
                                'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors',
                            socialButtonsBlockButtonText: 'text-slate-200 font-medium',
                            dividerLine: 'bg-slate-700',
                            dividerText: 'text-slate-500',
                            formFieldLabel: 'text-slate-300',
                            formFieldInput:
                                'bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20',
                            formButtonPrimary:
                                'bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold transition-colors',
                            footerActionLink: 'text-amber-400 hover:text-amber-300',
                            identityPreviewText: 'text-slate-300',
                            identityPreviewEditButton: 'text-amber-400',
                        },
                    }}
                />
            </div>
        </div>
    )
}

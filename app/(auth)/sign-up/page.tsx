'use client'

import { SignUp, useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Role = 'user' | 'author'

const ROLE_LABEL: Record<string, string> = {
    user: 'Reader',
    author: 'Author',
    admin: 'Admin',
}

const DASH: Record<string, string> = {
    user: '/user/dashboard',
    author: '/author/dashboard',
    admin: '/admin/dashboard',
}

export default function SignUpPage() {
    const { isLoaded, isSignedIn, user } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()

    const [selectedRole, setSelectedRole] = useState<Role>('user')
    const [isSettingRole, setIsSettingRole] = useState(false)
    // When an already-registered user lands here
    const [existingRole, setExistingRole] = useState<string | null>(null)

    // Hydrate selectedRole from localStorage after mount (SSR-safe)
    useEffect(() => {
        const saved = localStorage.getItem('pendingRole') as Role | null
        if (saved === 'author' || saved === 'user') setSelectedRole(saved)
    }, [])

    useEffect(() => {
        console.log('[sign-up] isLoaded:', isLoaded, '| isSignedIn:', isSignedIn)
        if (!isLoaded || !isSignedIn || !user) return

        const role = user.publicMetadata?.role as string | undefined
        console.log('[sign-up] userId:', user.id, '| email:', user.primaryEmailAddress?.emailAddress, '| existingRole:', role, '| selectedRole:', selectedRole)

        // Already has a role → show warning instead of silently redirecting
        if (role) {
            console.log('[sign-up] Already registered as:', role, '→ showing warning screen')
            localStorage.removeItem('pendingRole')
            setExistingRole(role)
            return
        }

        // Brand-new user — assign the chosen role
        const assignRole = async () => {
            console.log('[sign-up] New user — calling /api/set-role with role:', selectedRole)
            setIsSettingRole(true)
            try {
                const res = await fetch('/api/set-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: selectedRole }),
                })
                console.log('[sign-up] /api/set-role status:', res.status)
                if (!res.ok) throw new Error('Failed to set role')
                const data = await res.json()
                console.log('[sign-up] /api/set-role response:', data)
                await user.reload()
                const dest = DASH[data.role] ?? '/user/dashboard'
                console.log('[sign-up] Role set successfully:', data.role, '→ redirecting to', dest)
                localStorage.removeItem('pendingRole')
                router.replace(dest)
            } catch (err) {
                console.error('[sign-up] Error setting role:', err)
                setIsSettingRole(false)
            }
        }

        assignRole()
    }, [isLoaded, isSignedIn, user]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Already-registered warning screen ──────────────────────────────────
    if (existingRole) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="text-2xl font-bold tracking-tighter mb-2">
                            <span className="text-[#C4956A]">Library</span><span className="text-[#222222]">MS</span>
                        </div>
                    </div>

                    {/* Warning card */}
                    <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-8 text-center">
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-[#222222] mb-2">
                            You already have an account
                        </h2>
                        <p className="text-[#666666] text-sm mb-1">
                            You&apos;re signed in as a{' '}
                            <span className="font-semibold text-[#C4956A]">
                                {ROLE_LABEL[existingRole] ?? existingRole}
                            </span>.
                        </p>
                        <p className="text-[#666666] text-sm mb-7">
                            You cannot create another account with the same login.
                            Please go to your dashboard or sign out to switch accounts.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Link
                                href={DASH[existingRole] ?? '/user/dashboard'}
                                className="w-full py-2.5 bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold rounded-xl text-sm transition-colors text-center"
                            >
                                Go to my {ROLE_LABEL[existingRole]} Dashboard
                            </Link>
                            <button
                                onClick={() => signOut(() => router.replace('/sign-in'))}
                                className="w-full py-2.5 border border-gray-200 hover:border-gray-300 text-[#666666] hover:text-[#222222] font-semibold rounded-xl text-sm transition-colors"
                            >
                                Sign out &amp; use a different account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Setting-role spinner ────────────────────────────────────────────────
    if (isSettingRole) {
        return (
            <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[#666666] text-sm font-medium">Setting up your account…</p>
                </div>
            </div>
        )
    }

    // ── Normal sign-up form ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="text-2xl font-bold tracking-tighter mb-2">
                    <span className="text-[#C4956A]">Library</span><span className="text-[#222222]">MS</span>
                </div>
                <p className="text-[#666666] text-sm">Create your account to get started</p>
            </div>

            {/* Role Toggle Card */}
            <div className="w-full max-w-md mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-semibold text-[#666666] uppercase tracking-widest mb-3 text-center">
                        I want to join as
                    </p>
                    <div className="relative flex bg-gray-100 rounded-xl p-1 gap-1">
                        {/* Sliding indicator */}
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg bg-[#C4956A] shadow transition-all duration-300 ease-in-out ${selectedRole === 'author' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                                }`}
                        />
                        <button
                            onClick={() => { setSelectedRole('user'); localStorage.setItem('pendingRole', 'user') }}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${selectedRole === 'user' ? 'text-white' : 'text-[#666666] hover:text-[#222222]'
                                }`}
                        >
                            Reader
                        </button>
                        <button
                            onClick={() => { setSelectedRole('author'); localStorage.setItem('pendingRole', 'author') }}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${selectedRole === 'author' ? 'text-white' : 'text-[#666666] hover:text-[#222222]'
                                }`}
                        >
                            Author
                        </button>
                    </div>

                    <p className="mt-3 text-center text-xs text-[#999] min-h-[1.25rem]">
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
                    forceRedirectUrl="/auth-redirect"
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-white shadow-sm border border-gray-100 rounded-2xl',
                            headerTitle: 'text-[#222222]',
                            headerSubtitle: 'text-[#666666]',
                            socialButtonsBlockButton:
                                'bg-white border border-gray-200 text-[#222222] hover:bg-gray-50 transition-colors',
                            socialButtonsBlockButtonText: 'text-[#222222] font-medium',
                            dividerLine: 'bg-gray-200',
                            dividerText: 'text-[#999]',
                            formFieldLabel: 'text-[#444]',
                            formFieldInput:
                                'bg-white border-gray-200 text-[#222222] placeholder:text-[#999] focus:border-[#C4956A] focus:ring-[#C4956A]/20',
                            formButtonPrimary:
                                'bg-[#C4956A] hover:bg-[#b5835a] text-white font-semibold transition-colors',
                            footerActionLink: 'text-[#C4956A] hover:text-[#b5835a]',
                            identityPreviewText: 'text-[#444]',
                            identityPreviewEditButton: 'text-[#C4956A]',
                        },
                    }}
                />
            </div>
        </div>
    )
}

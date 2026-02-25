'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return

        const role = user.publicMetadata?.role as string | undefined

        if (role === 'admin') {
            router.replace('/admin/dashboard')
        } else if (role === 'author') {
            router.replace('/author/dashboard')
        } else {
            router.replace('/user/dashboard')
        }
    }, [isLoaded, isSignedIn, user, router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-3xl">📚</span>
                    <h1 className="text-2xl font-bold text-white tracking-tight">LibraryMS</h1>
                </div>
                <p className="text-slate-400 text-sm">Welcome back — sign in to continue</p>
            </div>

            {/* Clerk SignIn Component */}
            <div className="w-full max-w-md">
                <SignIn
                    routing="hash"
                    signUpUrl="/sign-up"
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

            {/* Sign-up link */}
            <p className="mt-6 text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <a
                    href="/sign-up"
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                    Sign Up
                </a>
            </p>
        </div>
    )
}

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
        console.log('[sign-in] Already signed in | userId:', user.id, '| role:', role, '| redirecting...')

        if (role === 'admin') {
            console.log('[sign-in] → /admin/dashboard')
            router.replace('/admin/dashboard')
        } else if (role === 'author') {
            console.log('[sign-in] → /author/dashboard')
            router.replace('/author/dashboard')
        } else {
            console.log('[sign-in] → /user/dashboard')
            router.replace('/user/dashboard')
        }
    }, [isLoaded, isSignedIn, user, router])

    return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="text-2xl font-bold tracking-tighter mb-2">
                    <span className="text-[#C4956A]">Library</span><span className="text-[#222222]">MS</span>
                </div>
                <p className="text-[#666666] text-sm">Welcome back — sign in to continue</p>
            </div>

            {/* Clerk SignIn Component */}
            <div className="w-full max-w-md">
                <SignIn
                    routing="hash"
                    signUpUrl="/sign-up"
                    forceRedirectUrl="/auth-redirect"
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-white shadow-lg border border-gray-100 rounded-2xl',
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

            {/* Sign-up link */}
            <p className="mt-6 text-sm text-[#666666]">
                Don&apos;t have an account?{' '}
                <a href="/sign-up" className="text-[#C4956A] hover:text-[#b5835a] font-medium transition-colors">
                    Sign Up
                </a>
            </p>
        </div>
    )
}

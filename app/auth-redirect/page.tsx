'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * /auth-redirect
 *
 * Landing point after every Clerk sign-in (set via forceRedirectUrl).
 * Reads role from Clerk publicMetadata and sends the user to their dashboard.
 * For brand-new users without a role yet, we fall back to /sign-up so the
 * role-selection + /api/set-role flow can still run.
 */
export default function AuthRedirectPage() {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()

    useEffect(() => {
        console.log('[auth-redirect] isLoaded:', isLoaded, '| isSignedIn:', isSignedIn)
        if (!isLoaded) return

        if (!isSignedIn) {
            console.log('[auth-redirect] Not signed in → redirecting to /sign-in')
            router.replace('/sign-in')
            return
        }

        const role = user.publicMetadata?.role as string | undefined
        console.log('[auth-redirect] userId:', user.id, '| email:', user.primaryEmailAddress?.emailAddress, '| role:', role)

        if (role === 'admin') {
            console.log('[auth-redirect] → /admin/dashboard')
            router.replace('/admin/dashboard')
        } else if (role === 'author') {
            console.log('[auth-redirect] → /author/dashboard')
            router.replace('/author/dashboard')
        } else if (role === 'user') {
            console.log('[auth-redirect] → /user/dashboard')
            router.replace('/user/dashboard')
        } else {
            console.log('[auth-redirect] No role found → /sign-up (new Google user)')
            router.replace('/sign-up')
        }
    }, [isLoaded, isSignedIn, user, router])

    return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#C4956A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#666666] text-sm font-medium">Signing you in…</p>
            </div>
        </div>
    )
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/auth-redirect',
    '/api/set-role',
    '/api/webhooks(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAuthorRoute = createRouteMatcher(['/author(.*)'])
const isUserRoute = createRouteMatcher(['/user(.*)'])

interface SessionClaims {
    metadata?: { role?: string }
}

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth()
    const claims = sessionClaims as SessionClaims
    const role = claims?.metadata?.role
    const pathname = req.nextUrl.pathname

    console.log(`[proxy] ${req.method} ${pathname} | userId: ${userId ?? 'none'} | role: ${role ?? 'none'}`)

    // Not logged in → only allow public routes
    if (!userId && !isPublicRoute(req)) {
        console.log(`[proxy] Not authenticated → redirecting to /sign-in`)
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Logged in — block wrong role from wrong routes
    if (userId && role) {
        if (isAdminRoute(req) && role !== 'admin') {
            const dest = role === 'author' ? '/author/dashboard' : role === 'user' ? '/user/dashboard' : '/sign-in'
            console.log(`[proxy] Role mismatch on admin route | role: ${role} → ${dest}`)
            return NextResponse.redirect(new URL(dest, req.url))
        }
        if (isAuthorRoute(req) && role !== 'author') {
            const dest = role === 'admin' ? '/admin/dashboard' : role === 'user' ? '/user/dashboard' : '/sign-in'
            console.log(`[proxy] Role mismatch on author route | role: ${role} → ${dest}`)
            return NextResponse.redirect(new URL(dest, req.url))
        }
        if (isUserRoute(req) && role !== 'user') {
            const dest = role === 'admin' ? '/admin/dashboard' : role === 'author' ? '/author/dashboard' : '/sign-in'
            console.log(`[proxy] Role mismatch on user route | role: ${role} → ${dest}`)
            return NextResponse.redirect(new URL(dest, req.url))
        }
    }
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
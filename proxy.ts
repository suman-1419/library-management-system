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

    // Not logged in → only allow public routes
    if (!userId && !isPublicRoute(req)) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Logged in — block wrong role from wrong routes
    if (userId && role) {
        if (isAdminRoute(req) && role !== 'admin') {
            if (role === 'author') return NextResponse.redirect(new URL('/author/dashboard', req.url))
            if (role === 'user') return NextResponse.redirect(new URL('/user/dashboard', req.url))
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
        if (isAuthorRoute(req) && role !== 'author') {
            if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
            if (role === 'user') return NextResponse.redirect(new URL('/user/dashboard', req.url))
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
        if (isUserRoute(req) && role !== 'user') {
            if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
            if (role === 'author') return NextResponse.redirect(new URL('/author/dashboard', req.url))
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
    }
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
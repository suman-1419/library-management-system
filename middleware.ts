import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAuthorRoute = createRouteMatcher(['/author(.*)'])
const isUserRoute = createRouteMatcher(['/user(.*)'])

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth()
    const role = sessionClaims?.metadata?.role as string | undefined

    // Not logged in → only allow public routes
    if (!userId && !isPublicRoute(req)) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Logged in — block wrong role from wrong routes
    if (userId && role) {
        if (isAdminRoute(req) && role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url))
        }
        if (isAuthorRoute(req) && role !== 'author') {
            return NextResponse.redirect(new URL('/author/dashboard', req.url))
        }
        if (isUserRoute(req) && role !== 'user') {
            return NextResponse.redirect(new URL('/user/dashboard', req.url))
        }
    }
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
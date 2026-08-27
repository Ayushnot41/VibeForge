import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js proxy handler (successor to middleware in Next.js 16+)
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization files)
     * - favicon.ico   (favicon)
     * - Public assets with common image/video extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
}

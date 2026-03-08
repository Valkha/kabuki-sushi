import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || 
    pathname.includes('.') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Initialisation de la réponse
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Rafraîchissement crucial de la session
  const { data: { user } } = await supabase.auth.getUser()

  const segments = pathname.split('/')
  const langInUrl = locales.find(l => segments[1] === l)

  if (!langInUrl && pathname !== '/login') {
    const newUrl = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    const redirectResponse = NextResponse.redirect(newUrl)
    
    // Copie de TOUS les cookies (y compris ceux de session fraîchement mis à jour)
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c)
    })
    
    return redirectResponse
  }

  if (pathname.includes('/admin') && !user) {
    return NextResponse.redirect(new URL(`/${langInUrl || defaultLocale}/login`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|auth).*)'],
}
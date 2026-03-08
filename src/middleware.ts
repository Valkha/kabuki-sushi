import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. EXCLUSIONS (Fichiers, API, auth)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || 
    pathname.includes('.') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next()
  }

  // 2. INITIALISATION SUPABASE
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

  // Rafraîchissement de la session
  const { data: { user } } = await supabase.auth.getUser()

  // 3. LOGIQUE DE LANGUES (i18n)
  const segments = pathname.split('/')
  const langInUrl = locales.find(l => segments[1] === l)

  if (!langInUrl && pathname !== '/login') {
    const newUrl = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    const redirectResponse = NextResponse.redirect(newUrl)
    
    // ✅ TRANSFERT RIGOUREUX DES COOKIES : Empêche la perte de session
    request.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set({
        name: c.name,
        value: c.value,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    })
    return redirectResponse
  }

  // 4. PROTECTION ADMIN
  if (pathname.includes('/admin') && !user) {
    return NextResponse.redirect(new URL(`/${langInUrl || defaultLocale}/login`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|auth).*)'],
}
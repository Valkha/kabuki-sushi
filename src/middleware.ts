import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

export async function middleware(request: NextRequest) {
  // --- 1. INITIALISATION DE LA SESSION SUPABASE ---
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ✅ CORRECTION : Suppression de 'options' car non utilisé ici
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchissement de la session
  await supabase.auth.getUser()

  // --- 2. LOGIQUE DE LANGUES (i18n) ---
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/auth') || 
    pathname.includes('.')
  ) {
    return response
  }

  const segments = pathname.split('/')
  const langInUrl = locales.find(l => segments[1] === l)

  if (!langInUrl && pathname !== '/login') {
    const newUrl = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    const redirectResponse = NextResponse.redirect(newUrl)
    
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
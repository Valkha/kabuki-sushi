// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- DEBUG : Affiche chaque requête dans ton terminal VS Code ---
  // console.log("👉 Requête reçue pour :", pathname)

  // 1. 🛑 BLOCAGE IMMÉDIAT DU LOGIN
  // Si l'URL contient "login", on stoppe tout et on sert la page brute.
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next()
  }

  // 2. 🛡️ EXCLUSIONS TECHNIQUES
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --- INITIALISATION SUPABASE (Uniquement pour l'admin) ---
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. 🔐 GESTION ADMIN
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // 4. 🌐 GESTION DES LANGUES (Seulement pour le reste)
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // Si on arrive ici, on ajoute /fr (Sauf si c'est /login, mais on a déjà filtré en haut)
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    )
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
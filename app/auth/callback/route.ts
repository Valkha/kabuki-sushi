import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // "next" est la page où l'utilisateur sera envoyé après la connexion (par défaut l'accueil)
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // On échange le code "provisoire" contre une session utilisateur "permanente"
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Succès ! On redirige l'utilisateur
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En cas d'erreur (code expiré, etc.), on renvoie vers la page de login avec un message
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
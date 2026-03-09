import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Vérification de la session
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Récupération ultra-sécurisée et simplifiée
    // On utilise .maybeSingle() pour éviter le crash 500 si le profil n'existe pas
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url") 
      .eq("id", authData.user.id)
      .maybeSingle(); 

    if (dbError) {
      // On affiche l'erreur réelle dans tes logs Vercel pour que tu puisses la voir
      console.error("🚨 Erreur Supabase détaillée:", JSON.stringify(dbError));
      return NextResponse.json({ error: "Erreur de base de données" }, { status: 500 });
    }

    // 3. Réponse propre (si profile est null, le front recevra { profile: null })
    return NextResponse.json({ profile });

  } catch (error: unknown) {
    // Gestion ESLint pour le type 'unknown'
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[CRITICAL_GET_PROFILE]:", errorMessage);
    
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: errorMessage }, 
      { status: 500 }
    );
  }
}
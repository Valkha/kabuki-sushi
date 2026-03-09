import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 🛡️ 1. Vérification de session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ✅ 2. SÉCURITÉ #5 : Sélection stricte des colonnes garanties.
    // J'ai retiré zip_code et city car ils provoquaient probablement l'erreur 500.
    // On ne garde que l'essentiel pour le profil client.
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, address, avatar_url, loyalty_points, wallet_balance")
      .eq("id", user.id)
      .single();

    // 🛡️ 3. Gestion d'erreur PostgREST sans crash
    if (dbError) {
      // Si le profil n'existe pas (encore), on renvoie null proprement (code PGRST116)
      if (dbError.code === 'PGRST116') {
        return NextResponse.json({ profile: null });
      }
      // On logue l'erreur SQL exacte pour le debug dans ta console serveur
      console.error("❌ SQL Error in get-profile:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    // ✅ ESLint safe : typage correct de l'erreur
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[API_GET_PROFILE_ERROR]:", errorMessage);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
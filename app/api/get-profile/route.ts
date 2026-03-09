import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 🛡️ Vérification de session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ✅ SÉCURITÉ #5 : Sélection stricte des colonnes. 
    // On exclut is_admin et is_livreur pour éviter toute fuite de privilèges vers le client.
    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, address, zip_code, city, avatar_url, loyalty_points, wallet_balance")
      .eq("id", user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') throw dbError;

    return NextResponse.json({ profile: profile || null });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[API_GET_PROFILE_ERROR]:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
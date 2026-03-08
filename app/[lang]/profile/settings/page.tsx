"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function SettingsPage() {
  const { profile } = useUser();
  const { lang } = useParams();
  const supabase = createClient();

  // On initialise directement avec les valeurs du profil pour éviter le useEffect
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [zipCode, setZipCode] = useState(profile?.zip_code || "");
  const [city, setCity] = useState(profile?.city || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async () => {
    // AUCUN changement d'état React ici (pas de setIsUpdating)
    alert("1. Script lancé - Zéro re-rendu");

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        alert("2. ERREUR AUTH : " + (authError?.message || "Session absente"));
        return;
      }

      alert("3. ID : " + authUser.id + "\nEnvoi en cours...");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          full_name: fullName,
          phone: phone,
          address: address,
          zip_code: zipCode,
          city: city,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        alert("4. ÉCHEC : " + error.message);
      } else {
        alert("5. SUCCESS ! Les données sont enregistrées.");
        // Une fois que c'est fini, on peut se permettre de rafraîchir
        window.location.reload();
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur fatale";
      alert("6. CRASH : " + msg);
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="inline-flex items-center gap-2 text-gray-400 mb-8">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
          <h1 className="text-2xl font-display font-bold uppercase mb-4">Mise à jour directe</h1>
          
          <div className="space-y-6">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tel" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white" />
            
            <div className="grid grid-cols-2 gap-4">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="CP" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white" />
            </div>

            {errorMsg && <div className="text-red-500 text-xs flex items-center gap-2"><AlertTriangle size={14}/> {errorMsg}</div>}

            <button 
              type="button" 
              onClick={handleUpdate}
              className="w-full bg-kabuki-red text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Sauvegarder (Test Direct)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
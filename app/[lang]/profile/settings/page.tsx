"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function SettingsPage() {
  const { profile } = useUser();
  const { lang } = useParams();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [zipCode, setZipCode] = useState(profile?.zip_code || "");
  const [city, setCity] = useState(profile?.city || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async () => {
    // 🛡️ PIÈGE À REDIRECTION : Si la page essaie de sauter, le navigateur va bloquer.
    window.onbeforeunload = () => "ARRÊT : Le site essaie de recharger la page !";
    
    alert("1. TEST NUCLÉAIRE LANCÉ");

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const targetId = "fef16323-7575-45f0-8f5e-2aaeee5d5cf9"; // Ton ID validé par l'audit

      alert("2. Variables OK. Envoi du FETCH direct...");

      const response = await fetch(`${url}/rest/v1/profiles?id=eq.${targetId}`, {
        method: 'PATCH',
        headers: {
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
          address: address,
          zip_code: zipCode,
          city: city,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert("3. VICTOIRE ! Le réseau a répondu OK.");
        window.onbeforeunload = null; // On libère le piège
        window.location.reload();
      } else {
        const errJson = await response.json();
        alert("❌ ERREUR RÉSEAU : " + JSON.stringify(errJson));
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur fatale";
      alert("💥 CRASH DU FETCH : " + msg);
      setErrorMsg(msg);
    } finally {
      window.onbeforeunload = null;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="mb-8 inline-flex items-center gap-2">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase">Retour</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
          <h1 className="text-2xl font-bold uppercase mb-4 text-red-500">Mode Commando : Force Update</h1>
          
          <div className="space-y-6">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tel" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" />
            
            <div className="grid grid-cols-2 gap-4">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="CP" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 p-4 rounded-xl" />
            </div>

            {errorMsg && <div className="text-red-500 text-xs flex items-center gap-2"><AlertTriangle size={14}/> {errorMsg}</div>}

            <button 
              type="button" 
              onClick={handleUpdate}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              FORCER LA SAUVEGARDE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
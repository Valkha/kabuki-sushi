"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { 
  UtensilsCrossed, 
  Star, 
  MessageSquare, 
  LogOut,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/utils/supabase";

// Import du composant WhatsApp
import WhatsAppButton from "@/components/WhatsAppButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, t } = useTranslation();

  // ✅ Correction de la déconnexion : window.location force la sortie du contexte /fr/
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isActive = (path: string) => pathname?.includes(path);

  const adminLinks = [
    { 
      name: t.nav.menu || "Carte", 
      path: `/${lang}/admin/menu`, 
      icon: <UtensilsCrossed size={16} /> 
    },
    { 
      name: "Avis", 
      path: `/${lang}/admin/avis`, 
      icon: <Star size={16} /> 
    },
    { 
      name: "Messages", 
      path: `/${lang}/admin/messages`, 
      icon: <MessageSquare size={16} /> 
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      
      {/* --- NOUVEAU HEADER (Remplace la Sidebar supprimée) --- */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          
          <div className="flex items-center gap-8">
            {/* Logo et Retour Site */}
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 bg-kabuki-red rounded flex items-center justify-center font-bold text-white text-xs">
                K
              </div>
              <Link href={`/${lang}`} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-white transition text-[10px] font-bold uppercase tracking-tighter">
                <ArrowLeft size={12} /> Voir le site
              </Link>
            </div>

            {/* Navigation Horizontale */}
            <nav className="flex items-center gap-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    isActive(link.path)
                      ? "bg-kabuki-red text-white shadow-lg shadow-red-900/20"
                      : "text-gray-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {link.icon}
                  <span className="uppercase tracking-widest">{link.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Bouton Déconnexion */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* --- ZONE DE CONTENU PRINCIPAL (Pleine largeur désormais) --- */}
      <main className="p-6 md:p-10 relative">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-[0.02] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>

      {/* Le bouton WhatsApp reste par-dessus */}
      <WhatsAppButton />

    </div>
  );
}
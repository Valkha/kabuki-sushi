"use client";

import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

export default function MobileActionBar() {
  const { t, lang } = useTranslation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-kabuki-black/90 backdrop-blur-lg border-t border-neutral-800 p-4 z-[40] flex gap-4">
      <a 
        href="tel:+41220000000" 
        className="flex-1 bg-neutral-800 text-white py-3 rounded-xl font-bold text-center text-sm border border-neutral-700 active:scale-95 transition-transform"
      >
        📞 {lang === "fr" ? "Appeler" : lang === "en" ? "Call" : "Llamar"}
      </a>
      <Link 
        href="/menu" 
        className="flex-1 bg-kabuki-red text-white py-3 rounded-xl font-bold text-center text-sm shadow-lg shadow-red-900/40 active:scale-95 transition-transform"
      >
        🍣 {lang === "fr" ? "Commander" : lang === "en" ? "Order" : "Pedir"}
      </Link>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { Phone, MessageCircle, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileActionBar() {
  const { lang } = useTranslation();
  const [showContactMenu, setShowContactMenu] = useState(false);

  // Ton vrai numéro Kabuki
  const phoneNumber = "41786041542"; 

  // Traductions internes au composant
  const text = {
    fr: { contact: "Contact", call: "Appel standard", wa: "WhatsApp", descCall: "Ligne directe", descWa: "Message gratuit", title: "Nous contacter" },
    en: { contact: "Contact", call: "Standard Call", wa: "WhatsApp", descCall: "Direct line", descWa: "Free message", title: "Contact us" },
    es: { contact: "Contacto", call: "Llamada", wa: "WhatsApp", descCall: "Línea directa", descWa: "Mensaje gratis", title: "Contactar" }
  }[lang as "fr" | "en" | "es"] || { contact: "Contact", call: "Appel", wa: "WhatsApp", descCall: "Ligne directe", descWa: "Message", title: "Contact" };

  return (
    <>
      {/* --- BARRE D'ACTION FIXE --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/95 backdrop-blur-xl border-t border-neutral-800 p-4 z-[40] flex gap-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* BOUTON CONTACT (Déclenche le menu) */}
        <button 
          onClick={() => setShowContactMenu(true)}
          className="flex-1 bg-neutral-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-neutral-800 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <Phone size={16} className="text-kabuki-red" />
          {text.contact}
        </button>

        {/* BOUTON COMMANDER */}
        <Link 
          href={`/${lang}/menu`} 
          className="flex-[1.3] bg-kabuki-red text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <span>🍣</span>
          {lang === "fr" ? "Commander" : lang === "en" ? "Order" : "Pedir"}
        </Link>
      </div>

      {/* --- MENU DE CHOIX (ACTION SHEET) --- */}
      <AnimatePresence>
        {showContactMenu && (
          <>
            {/* Overlay sombre */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactMenu(false)}
              className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
            />
            
            {/* Panneau coulissant */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-neutral-900 rounded-t-[32px] p-8 z-[110] border-t border-neutral-800"
            >
              {/* Petite barre de drag visuelle */}
              <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-8" />

              <div className="flex justify-between items-center mb-8">
                <h3 className="font-display font-bold text-xl uppercase italic text-white tracking-tighter">
                  Kabuki <span className="text-kabuki-red">{text.contact}</span>
                </h3>
                <button 
                  onClick={() => setShowContactMenu(false)}
                  className="bg-neutral-800 p-2 rounded-full text-gray-400"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                {/* OPTION : APPEL STANDARD */}
                <a 
                  href={`tel:+${phoneNumber}`}
                  className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                      <Phone size={24}/>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-sm">{text.call}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{text.descCall}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-neutral-700" />
                </a>

                {/* OPTION : WHATSAPP */}
                <a 
                  href={`https://wa.me/${phoneNumber}`}
                  target="_blank"
                  className="flex items-center justify-between p-5 bg-green-500/10 rounded-2xl border border-green-500/20 active:bg-green-500/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500/20 p-3 rounded-xl text-green-500">
                      <MessageCircle size={24}/>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-green-500 text-sm">{text.wa}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest">{text.descWa}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-green-900/50" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
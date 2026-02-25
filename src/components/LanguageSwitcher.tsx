"use client";

import { useTranslation } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const languages = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
  ] as const;

  return (
    <div className="flex items-center gap-3 border-l border-neutral-800 ml-4 pl-4 h-6">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`text-[10px] font-bold tracking-widest transition-all duration-300 ${
            lang === l.code ? "text-kabuki-red scale-110" : "text-neutral-500 hover:text-white"
          }`}
        >
          <motion.span whileTap={{ scale: 0.9 }}>
            {l.label}
          </motion.span>
        </button>
      ))}
    </div>
  );
}
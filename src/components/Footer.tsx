"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext"; // Import du hook

export default function Footer() {
  const { t, lang } = useTranslation(); // Récupération des traductions et de la langue actuelle

  return (
    <footer className="bg-kabuki-black text-white border-t border-neutral-800 pt-16 pb-8">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLONNE 1 : LOGO & DESCRIPTION */}
          <div className="space-y-6">
            <Link href="/" className="inline-block w-32">
              <Image 
                src="/images/logo.png" 
                alt="Kabuki Sushi Logo" 
                width={150} 
                height={150} 
                className="w-full h-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.footer.desc}
            </p>
            {/* Réseaux Sociaux */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-kabuki-red transition text-white text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-kabuki-red transition text-white text-xs font-bold">
                FB
              </a>
            </div>
          </div>

          {/* COLONNE 2 : LIENS RAPIDES */}
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-widest mb-6 border-l-4 border-kabuki-red pl-3">
              {t.footer.linksTitle}
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/" className="hover:text-kabuki-red transition">{t.nav.home}</Link></li>
              <li><Link href="/menu" className="hover:text-kabuki-red transition">{t.nav.menu}</Link></li>
              <li><Link href="/traiteur" className="hover:text-kabuki-red transition">{t.nav.catering}</Link></li>
              <li><Link href="/contact" className="hover:text-kabuki-red transition">{t.nav.contact}</Link></li>
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT */}
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-widest mb-6 border-l-4 border-kabuki-red pl-3">
              {t.footer.contactTitle}
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start">
                <span className="text-kabuki-red mr-3">📍</span>
                <span>1 Boulevard de la Tour,<br/>1205 Genève, Suisse</span>
              </li>
              <li className="flex items-center">
                <span className="text-kabuki-red mr-3">📞</span>
                <a href="tel:+41220000000" className="hover:text-white transition">+41 22 000 00 00</a> 
              </li>
            </ul>
          </div>

          {/* COLONNE 4 : HORAIRES */}
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-widest mb-6 border-l-4 border-kabuki-red pl-3">
              {t.contact.opening}
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex justify-between">
                <span>{lang === "fr" ? "Lundi - Samedi" : lang === "en" ? "Monday - Saturday" : "Lunes - Sábado"}</span>
                <span className="text-white">11h00 - 14h30</span>
              </li>
              <li className="flex justify-between border-b border-neutral-800 pb-2 mb-2">
                <span></span>
                <span className="text-white">18h00 - 22h30</span>
              </li>
              <li className="flex justify-between text-kabuki-red font-bold">
                <span>{lang === "fr" ? "Dimanche" : lang === "en" ? "Sunday" : "Domingo"}</span>
                <span>{lang === "fr" ? "Fermé" : lang === "en" ? "Closed" : "Cerrado"}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
          <p>{t.footer.rights.replace("2026", new Date().getFullYear().toString())}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">
              {lang === "fr" ? "Mentions Légales" : lang === "en" ? "Legal Notice" : "Aviso Legal"}
            </a>
            <a href="#" className="hover:text-white transition">
              {lang === "fr" ? "Politique de Confidentialité" : lang === "en" ? "Privacy Policy" : "Política de Privacidad"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
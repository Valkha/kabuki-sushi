"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // SÉCURITÉ : On utilise un petit délai pour éviter le "cascading render" de React
    // Cela décale l'action juste après le rendu initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    window.addEventListener("start-loader", handleStart);
    window.addEventListener("stop-loader", handleStop);
    
    // Nettoyage des événements et du timer à la destruction du composant
    return () => {
      clearTimeout(timer);
      window.removeEventListener("start-loader", handleStart);
      window.removeEventListener("stop-loader", handleStop);
    };
  }, [pathname]);

  // --- Configuration de l'animation du cercle qui tourne ---
  const spinnerVariants = {
    start: { rotate: 0 },
    end: { 
      rotate: 360, 
      transition: { 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "linear" as const // <--- LA MAGIE EST ICI
      } 
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          // On met un fond noir très légèrement transparent et flouté pour un effet moderne
          className="fixed inset-0 z-[9999] bg-kabuki-black/95 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto"
        >
          {/* Conteneur RELATIF : Il sert de repère pour centrer le logo et le cercle.
            On lui donne une taille fixe (w-64 h-64) suffisante pour contenir le tout.
          */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* --- LE CERCLE ROUGE TOURNANT (SVG) --- */}
            <motion.svg
              className="absolute inset-0 w-full h-full" // Prend toute la place du conteneur relatif
              viewBox="0 0 100 100"
              variants={spinnerVariants}
              initial="start"
              animate="end"
            >
              {/* Cercle de fond gris très léger (optionnel, pour l'effet "piste") */}
              <circle
                cx="50" cy="50" r="45"
                stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.1"
              />

              {/* Le cercle ROUGE actif */}
              <motion.circle
                cx="50" cy="50" r="45"
                stroke="#E60012" // La couleur Kabuki Red
                strokeWidth="3"  // Épaisseur du trait
                fill="none"
                strokeLinecap="round" // Bords arrondis pour le trait
                /* L'astuce du cercle incomplet :
                   On définit un trait de 180px de long, suivi d'un vide.
                   Cela crée l'arc de cercle qui va tourner.
                */
                strokeDasharray="180 360"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </motion.svg>

            {/* --- LE LOGO CENTRAL --- */}
            {/* On garde votre animation de pulsation existante */}
            <motion.div 
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative z-10" // z-10 pour être sûr qu'il est visuellement "au-dessus" du vide du cercle
            >
              <Image 
                src="/images/logo.png" 
                alt="Kabuki Loading..." 
                width={160} // Taille ajustée pour bien rentrer dans le cercle
                height={160} 
                priority
                className="object-contain"
              />
            </motion.div>
            
          </div>

          {/* Petit texte optionnel en dessous */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
             className="text-white font-display uppercase tracking-[0.2em] mt-2 text-sm"
          >
            Chargement...
          </motion.p>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
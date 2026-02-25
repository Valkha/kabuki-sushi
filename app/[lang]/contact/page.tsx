"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, MapPin, Send, Loader2, CheckCircle, 
  Users, Calendar, Clock, ArrowRight 
} from "lucide-react"; // ✅ 'Mail' a été retiré ici
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t, lang } = useTranslation();
  
  // --- ÉTATS DU FORMULAIRE ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Général",
    phone: "",
    date: "",
    guests: "",
    message: ""
  });

  // --- LOGIQUE D'ENVOI RÉELLE ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // On appelle l'API située dans /app/api/contact/route.ts
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSent(true);
        // Réinitialisation du formulaire après succès
        setFormData({ name: "", email: "", subject: "Général", phone: "", date: "", guests: "", message: "" });
        
        // Retour à l'état initial après 5 secondes
        setTimeout(() => {
          setIsSent(false);
        }, 5000);
      } else {
        const errorData = await response.json();
        alert(lang === "fr" ? "Erreur : " + errorData.message : "Error: " + errorData.message);
      }
    } catch { 
      // ✅ Solution optimale : On retire la variable 'error' inutilisée ici (Ligne 54)
      alert(lang === "fr" ? "Une erreur réseau est survenue." : "A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-black text-white pt-40 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-5 z-0"></div>
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest relative z-10">
            {t.contact.title}
          </h1>
          <p className="text-gray-400 mt-4 text-sm md:text-base relative z-10 max-w-xl mx-auto px-6 italic">
            {t.contact.subtitle}
          </p>
          <div className="w-16 h-1 bg-kabuki-red mx-auto mt-8 relative z-10"></div>
        </Reveal>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* --- COLONNE GAUCHE : INFOS DE CONTACT --- */}
          <div className="space-y-12">
            <Reveal x={-30}>
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-kabuki-red border border-neutral-700 group-hover:bg-kabuki-red group-hover:text-white transition-all shadow-xl shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">{t.contact.address}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Kabuki Sushi Genève<br />
                    1 Boulevard de la Tour<br />
                    1205 Genève, Suisse
                  </p>
                  <a href="https://goo.gl/maps/..." target="_blank" className="inline-flex items-center gap-2 mt-3 text-kabuki-red hover:text-white transition font-bold text-xs uppercase tracking-widest">
                    {t.contact.follow} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal x={-30} delay={0.2}>
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-kabuki-red border border-neutral-700 group-hover:bg-kabuki-red group-hover:text-white transition-all shadow-xl shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">{t.contact.opening}</h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between w-64 border-b border-neutral-800 pb-1">
                        <span className="font-bold text-white">Lun - Sam</span>
                        <span>11:00 - 14:30 / 18:00 - 22:30</span>
                    </div>
                    <div className="flex justify-between w-64 pt-1">
                        <span className="font-bold text-white">Dimanche</span>
                        <span className="text-kabuki-red italic font-bold">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal x={-30} delay={0.4}>
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-kabuki-red border border-neutral-700 group-hover:bg-kabuki-red group-hover:text-white transition-all shadow-xl shrink-0">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">Contact Direct</h3>
                  <p className="text-gray-400 flex items-center gap-2">Tél : <a href="tel:+41220000000" className="text-white hover:text-kabuki-red font-bold transition">+41 22 000 00 00</a></p>
                  <p className="text-gray-400 flex items-center gap-2">Email : <a href="mailto:info@kabukisushi.ch" className="text-white hover:text-kabuki-red font-bold transition">info@kabukisushi.ch</a></p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* --- COLONNE DROITE : FORMULAIRE --- */}
          <Reveal y={30} delay={0.5}>
            <div className="bg-neutral-800/40 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-neutral-700/50 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSent ? (
                  <motion.form 
                    key="contact-form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} className="space-y-6"
                  >
                    <h3 className="text-2xl font-display font-bold text-white uppercase mb-4">
                        {t.catering.formSection.title}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.catering.formSection.name}</label>
                        <input required type="text" className="w-full bg-black/40 text-white border border-neutral-700 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition-all shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.catering.formSection.email}</label>
                        <input required type="email" className="w-full bg-black/40 text-white border border-neutral-700 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition-all shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sujet</label>
                            <select className="w-full bg-black/40 text-white border border-neutral-700 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition appearance-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                                <option value="Général">Question Générale</option>
                                <option value="Traiteur">Événement & Traiteur</option>
                                <option value="Groupe">Réservation de Groupe</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Téléphone</label>
                            <input type="tel" className="w-full bg-black/40 text-white border border-neutral-700 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition shadow-inner" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>

                    <AnimatePresence>
                      {formData.subject === "Traiteur" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="grid md:grid-cols-2 gap-6 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-kabuki-red uppercase flex items-center gap-2 tracking-widest">
                                <Calendar size={12}/> Date souhaitée
                            </label>
                            <input type="date" className="w-full bg-black/40 text-white border border-kabuki-red/30 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-kabuki-red uppercase flex items-center gap-2 tracking-widest">
                                <Users size={12}/> Convives
                            </label>
                            <input type="number" placeholder="Ex: 25" className="w-full bg-black/40 text-white border border-kabuki-red/30 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Message</label>
                      <textarea required rows={4} className="w-full bg-black/40 text-white border border-neutral-700 focus:border-kabuki-red rounded-2xl px-5 py-4 outline-none transition resize-none shadow-inner" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-kabuki-red text-white font-bold py-5 rounded-2xl hover:bg-red-700 transition shadow-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> {t.catering.formSection.submit}</>}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="py-20 text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
                      <CheckCircle size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest mb-2">Message Envoyé</h3>
                        <p className="text-gray-400 italic text-sm max-w-xs mx-auto">
                            Arigato ! Notre équipe Kabuki reviendra vers vous très rapidement.
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="w-full h-[450px] bg-neutral-800 border-t border-neutral-800 grayscale invert-[.1] opacity-60 hover:opacity-100 transition-all duration-1000">
        <iframe 
          src="https://www.google.com/maps/embed?pb=..." 
          width="100%" 
          height="100%" 
          style={{border:0}} 
          allowFullScreen={true} 
          loading="lazy" 
          className="filter grayscale contrast-125 brightness-75"
        ></iframe>
      </div>

    </div>
  );
}
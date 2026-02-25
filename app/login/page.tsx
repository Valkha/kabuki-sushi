"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants incorrects. Vérifie ton accès.");
      setLoading(false);
    } else {
      router.push("/admin/menu");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">
            Kabuki <span className="text-kabuki-red">Admin</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Accès restreint au personnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-white outline-none focus:border-kabuki-red transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-white outline-none focus:border-kabuki-red transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-kabuki-red text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kabuki-red text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
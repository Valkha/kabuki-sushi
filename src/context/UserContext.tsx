"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number;
  is_admin: boolean;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());
  const isInitialMount = useRef(true);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log("🔍 UserContext: Récupération du profil...");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data as UserProfile);
        console.log("✅ UserContext: Profil chargé");
      }
    } catch (err) {
      console.error("❌ UserContext: Erreur profil", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = async () => {
    console.log("🚪 UserContext: Déconnexion en cours...");
    try {
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("UserContext: Erreur signOut", error);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
      console.log("✅ UserContext: Déconnecté");
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    if (isInitialMount.current) {
      initAuth();
      isInitialMount.current = false;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("🔔 UserContext: AuthStateChange -", event);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile: () => fetchProfile(user?.id || ""), signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error("useUser must be used within a UserProvider");
  return context;
};
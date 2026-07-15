"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const [view, setView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });
        
        if (error) throw error;
        
        // If email confirmation is required, inform the user
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("Account already exists with this email address.");
        } else if (data.session === null) {
          setError("Registration successful! Please check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes("Load failed") || err.message.includes("Failed to fetch"))) {
        setError(`Network Error: ${err.message}. This is usually caused by an Ad Blocker, a VPN, or missing Supabase CORS settings for this domain.`);
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] dark:bg-black items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 max-w-md w-full bg-white dark:bg-[#111] p-12 border border-stone-200 dark:border-stone-800 shadow-xl"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400">Portal</span>
          <h1 className="text-3xl font-serif font-light tracking-tight text-stone-900 dark:text-white">
            Welcome <span className="italic text-stone-400">Back</span>
          </h1>
          <p className="text-stone-500 font-light mt-4">
            {user.user_metadata?.first_name 
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` 
              : user.email}
          </p>
          
          <div className="flex flex-col w-full gap-4 mt-8">
            <Link 
              href="/orders" 
              className="w-full py-4 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:border-stone-900 dark:hover:border-stone-500 transition-colors"
            >
              Order History
            </Link>
            <button 
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fcfcfc] dark:bg-black items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white dark:bg-[#111] p-10 md:p-14 border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col items-center gap-8"
      >
        <div className="text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-400 block">Portal</span>
          <h1 className="text-4xl font-serif font-light tracking-tight text-stone-900 dark:text-white">
            {view === "login" ? (
              <>Client <span className="italic text-stone-400">Login</span></>
            ) : (
              <>Create <span className="italic text-stone-400">Account</span></>
            )}
          </h1>
        </div>

        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-100 text-red-600 text-sm text-center font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <AnimatePresence mode="popLayout">
            {view === "register" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 overflow-hidden"
              >
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 px-4 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors font-light text-sm text-stone-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 px-4 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors font-light text-sm text-stone-900 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 px-4 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors font-light text-sm text-stone-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 px-4 py-3 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors font-light text-sm text-stone-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-stone-900 dark:bg-white px-8 py-4 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
              {view === "login" ? "Sign In" : "Sign Up"}
            </span>
          </button>
        </form>

        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 w-full text-center">
          <button
            onClick={() => {
              setView(view === "login" ? "register" : "login");
              setError(null);
            }}
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest"
          >
            {view === "login" ? "Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

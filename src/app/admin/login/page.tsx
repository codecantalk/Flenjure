"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, Loader2, KeyRound, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBypassMode, setIsBypassMode] = useState(
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isBypassMode) {
      // Simulate login for local dev bypass
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        setErrorMsg("Access denied. You must be an authorized admin.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-100 selection:bg-amber-500 selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-3xl font-light text-amber-500">F</span>
        </div>
        <h2 className="text-3xl font-serif font-extralight tracking-wider text-white">
          Flenjure CMS Panel
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-stone-500">
          Secure Administration Hub
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-stone-900/40 backdrop-blur-xl border border-stone-850 py-10 px-6 sm:px-10 rounded-2xl shadow-2xl">
          {isBypassMode && (
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-3 text-xs leading-relaxed">
              <AlertTriangle className="flex-shrink-0" size={16} />
              <div>
                <span className="font-bold">Developer Bypass Mode:</span> Supabase environment variables are not fully configured yet. You can click "Access Dashboard" directly to bypass login and test the CMS.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {!isBypassMode && (
              <>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                      <Mail size={16} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@flenjure.com"
                      className="w-full bg-stone-950/80 border border-stone-800 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-light text-sm placeholder:text-stone-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs uppercase tracking-wider text-stone-400 font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                      <Lock size={16} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-950/80 border border-stone-800 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-light text-sm placeholder:text-stone-600"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium text-xs uppercase tracking-[0.2em] py-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>{isBypassMode ? "Access Dashboard" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

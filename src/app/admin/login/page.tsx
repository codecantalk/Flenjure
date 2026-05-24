"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Check if env variables exist
  const isBypassMode = 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isBypassMode) {
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

      // We expect the user to be an admin (managed via RLS or logic)
      // Since Flenjure handles admin roles, let's let them straight into the dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login?reset=true`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      setErrorMsg("Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <Image 
            src="/logo.png" 
            alt="Flenjure" 
            width={160} 
            height={50} 
            className="object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          {isResetMode ? "Reset your password" : "Log in to Flenjure"}
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          {isResetMode ? "Enter your email to receive a recovery link" : "Secure administration hub"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#111] py-8 px-6 sm:px-10 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          {isBypassMode && !isResetMode && (
            <div className="mb-6 p-4 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex gap-3 text-sm leading-relaxed">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold text-stone-900 dark:text-white">Developer Bypass:</span> No authentication configured. Click access to enter the dashboard.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          {resetSent ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">
                A password reset link has been sent to <strong>{email}</strong>.
              </div>
              <button
                onClick={() => { setIsResetMode(false); setResetSent(false); }}
                className="text-sm font-medium text-stone-900 dark:text-white hover:underline"
              >
                Return to login
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={isResetMode ? handleResetPassword : handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-900 dark:text-stone-200 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors text-sm text-stone-900 dark:text-white"
                />
              </div>

              {!isResetMode && !isBypassMode && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-stone-900 dark:text-stone-200">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setIsResetMode(true)}
                      className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 outline-none focus:border-stone-900 dark:focus:border-stone-500 transition-colors text-sm text-stone-900 dark:text-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium text-sm py-2.5 rounded-md hover:bg-stone-800 dark:hover:bg-stone-100 transition-all duration-300 shadow-sm disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <span>
                      {isResetMode 
                        ? "Send reset link" 
                        : (isBypassMode ? "Access dashboard" : "Log in")}
                    </span>
                    {!isResetMode && <ArrowRight size={16} />}
                  </>
                )}
              </button>

              {isResetMode && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    Back to login
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

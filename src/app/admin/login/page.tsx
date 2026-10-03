"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "@/components/ui/Link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notAuthorized = searchParams.get("motivo") === "non-autorizzato";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    notAuthorized ? "Questo account non è abilitato all'area amministrativa." : ""
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Email o password non corrette."
            : `Accesso non riuscito: ${signInError.message}`
        );
        return;
      }

      // Il middleware verifica il ruolo admin: se manca rimanda qui con un messaggio.
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossibile contattare il servizio di accesso.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-tech-grid-dark flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-[#008e97] via-[#f58220] to-[#df0000]" />

        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <Image src="/favicon.webp" alt="Safety Works" width={56} height={56} priority className="w-14 h-14 object-contain mb-3" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              SAFETY<span className="text-[#008e97]">WORKS</span> Admin
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Area riservata
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-xl bg-[#fdf2f2] border border-[#df0000]/30 text-[#df0000] text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 px-4 bg-[#008e97] hover:bg-[#00777f] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? "Verifica credenziali..." : "Accedi al Pannello"}</span>
              {!isLoggingIn && (
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[#008e97] transition-colors inline-flex items-center gap-1"
            >
              <span>← Torna al sito pubblico</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

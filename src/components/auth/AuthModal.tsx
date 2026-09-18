"use client";

import React, { useState } from "react";
import { X, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured) {
      // Supabase demo fallback simulation
      setTimeout(() => {
        setLoading(false);
        setMessage({
          type: "success",
          text: `Autenticazione simulata con successo per ${email}. Per abilitare la persistenza reale degli utenti, configura NEXT_PUBLIC_SUPABASE_URL e ANON_KEY in .env.local`,
        });
      }, 700);
      return;
    }

    try {
      const supabase = createClient();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Accesso effettuato con successo! Reindirizzamento all'area riservata...",
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Registrazione inviata! Controlla la tua casella email per verificare l'account.",
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Si è verificato un errore durante l'autenticazione.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#008e97]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Technical Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-cyan via-brand-orange to-brand-red" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-600 hover:text-[#008e97] hover:bg-white rounded-lg transition-colors"
          aria-label="Chiudi finestra"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan-light border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Area Riservata Clienti</h3>
              <p className="text-xs text-slate-600">Piattaforma Corsisti & Fascicoli Aziendali</p>
            </div>
          </div>

          {/* Toggle Login / Register */}
          <div className="grid grid-cols-2 p-1 bg-white rounded-lg mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`py-2 rounded-md transition-all ${
                isLogin
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-[#008e97]"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`py-2 rounded-md transition-all ${
                !isLogin
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-[#008e97]"
              }`}
            >
              Nuovo Utente
            </button>
          </div>

          {/* Feedback messages */}
          {message && (
            <div
              className={`p-3.5 rounded-lg mb-5 flex items-start space-x-2.5 text-sm ${
                message.type === "success"
                  ? "bg-[#e6f6f7] border border-slate-200 text-slate-900"
                  : "bg-[#fdf2f2] border border-[#df0000]/30 text-[#df0000]"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#008e97] mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#df0000] mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">{message.text}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                Email Aziendale
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@azienda.it"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert("Per recuperare la password contatta l'assistenza tecnica o inserisci la tua email registrata.")}
                    className="text-xs text-brand-cyan hover:underline"
                  >
                    Password dimenticata?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-brand-cyan hover:bg-brand-cyan-hover text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-tech-cyan flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Elaborazione in corso..." : isLogin ? "Accedi al Portale" : "Crea Account Corsista"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>Protetto da crittografia SSL / TLS</span>
            <span>Supabase Auth Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}


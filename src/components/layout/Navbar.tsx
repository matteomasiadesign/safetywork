"use client";

import React, { useState, useEffect } from "react";
import Link from "@/components/ui/Link";
import { Menu, X, Shield, PhoneCall, ChevronRight, ChevronDown } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { COMPANY_CONFIG } from "@/config/company";
import BrandStripe from "@/components/ui/BrandStripe";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { 
      name: "Corsi", 
      href: "/corsi",
      subsections: [
        { name: "Tutti i Corsi", href: "/corsi" },
        { name: "Corsi RSPP Datore di Lavoro", href: "/corsi/rspp-datore-di-lavoro" },
        { name: "Corsi Antincendio ed Emergenze", href: "/corsi/addetto-antincendio-emergenze" },
        { name: "Corsi Primo Soccorso Aziendale", href: "/corsi/primo-soccorso-aziendale" },
        { name: "Corsi RLS", href: "/corsi/rappresentante-lavoratori-sicurezza-rls" },
        { name: "Carrelli Elevatori (Muletto)", href: "/corsi/patentino-carrelli-elevatori-muletto" },
      ]
    },
    { name: "Chi Siamo", href: "/chi-siamo" },
    { 
      name: "Servizi", 
      href: "/#servizi",
      subsections: [
        { name: "Tutti i Servizi", href: "/#servizi" },
        { name: "Servizi HSE e RSPP Esterno", href: "/#servizi" },
        { name: "Sicurezza nei Cantieri (CSE/CSP)", href: "/#servizi" },
        { name: "Controllo Operativo e Verifiche", href: "/#servizi" },
        { name: "Gestione Documentale e Nomine", href: "/#servizi" },
      ]
    },
    { name: "Contatti", href: "/#contatti" },
  ];

  return (
    <>
      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 flex flex-col transition-all duration-300 border-b border-slate-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        {/* Brand Accent Top Line */}
        <BrandStripe height="h-[3px]" />

        <div className="h-[68px] flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="w-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-cyan transform -rotate-6 rounded-xl transition-transform group-hover:rotate-0 duration-300 shadow-sm" />
                <div className="absolute inset-1 bg-[#df0000] transform rotate-6 rounded-lg opacity-90 transition-transform group-hover:rotate-12 duration-300" />
                <div className="relative z-10 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    SAFETY<span className="text-brand-cyan">WORK</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#df0000] bg-[#fdf2f2] px-1.5 py-0.5 rounded border border-[#df0000]/20 whitespace-nowrap">
                    S.r.l.s.
                  </span>
                </div>
                <span className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase -mt-0.5 whitespace-nowrap">
                  Sicurezza & Igiene Lavoro
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-brand-cyan transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-cyan hover:after:w-full after:transition-all after:duration-300 whitespace-nowrap"
                  >
                    {link.name}
                    {link.subsections && <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {link.subsections && (
                    <div className={`absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl transition-all duration-300 transform origin-top ${
                      activeDropdown === link.name ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'
                    }`}>
                      <div className="py-2 flex flex-col">
                        {link.subsections.map((sub, index) => (
                          <Link 
                            key={index}
                            href={sub.href}
                            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#e6f6f7] hover:text-[#008e97] transition-colors flex items-center justify-between group/sub"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 transition-all group-hover/sub:opacity-100 group-hover/sub:translate-x-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              {/* Chiamata Diretta */}
              <a
                href="tel:+393505973817"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-[#008e97] bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#008e97]/40 rounded-full transition-all shadow-xs whitespace-nowrap"
                title="Chiama direttamente"
              >
                <PhoneCall className="w-4 h-4 text-[#008e97] shrink-0" />
                <span>Chiama Ora</span>
              </a>

              {/* Primary Consultation CTA */}
              <Link
                href="/#contatti"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#df0000] hover:bg-[#df0000]/90 rounded-full shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span>Richiedi Consulenza</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <a
                href="tel:+393505973817"
                className="p-2 text-slate-900 hover:text-[#008e97] hover:bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center"
                aria-label="Chiama direttamente"
              >
                <PhoneCall className="w-5 h-5 text-[#008e97]" />
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-900 hover:text-[#008e97] hover:bg-white rounded-full border border-slate-200 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1 max-h-[60vh] overflow-y-auto">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col">
                  <Link
                    href={link.href}
                    onClick={() => !link.subsections && setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-base font-semibold text-slate-900 hover:text-brand-cyan hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    {link.name}
                    {link.subsections && <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </Link>
                  {link.subsections && (
                    <div className="pl-6 pr-3 py-1 flex flex-col space-y-1 border-l-2 border-slate-100 ml-4 mb-2">
                      {link.subsections.map((sub, idx) => (
                        <Link
                          key={idx}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2 text-sm font-medium text-slate-600 hover:text-[#008e97] transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
              <a
                href="tel:+393505973817"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-900 bg-white border border-slate-200 hover:border-[#008e97] rounded-xl transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#008e97]" />
                <span>Chiama: +39 350 597 3817</span>
              </a>
              <Link
                href="/#contatti"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#df0000] hover:bg-[#df0000]/90 rounded-xl shadow-xs"
              >
                <span>Richiedi Preventivo / Consulenza</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Supabase Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

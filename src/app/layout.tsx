import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Providers } from "./providers";
import { COMPANY_CONFIG } from "@/config/company";
import FloatingContactWidget from "@/components/ui/FloatingContactWidget";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#008e97",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: `${COMPANY_CONFIG.name} | ${COMPANY_CONFIG.tagline}`,
  description: COMPANY_CONFIG.description,
  keywords: [
    "Safety Work",
    "Sicurezza sul lavoro",
    "D.Lgs. 81/08",
    "Corsi sicurezza lavoro",
    "DVR",
    "RSPP",
    "RLS",
    "Antincendio",
    "Primo Soccorso",
    "Igiene industriale",
    "Consulenza sicurezza Porto Torres",
    "Formazione accreditata Sardegna",
  ],
  authors: [{ name: COMPANY_CONFIG.name }],
  creator: COMPANY_CONFIG.name,
  openGraph: {
    title: `${COMPANY_CONFIG.name} | ${COMPANY_CONFIG.tagline}`,
    description: COMPANY_CONFIG.description,
    type: "website",
    locale: "it_IT",
    siteName: COMPANY_CONFIG.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`scroll-smooth ${plusJakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-brand-cyan selection:text-white font-sans antialiased">
        <Providers>
          {children}
          <FloatingContactWidget />
        </Providers>
      </body>
    </html>
  );
}

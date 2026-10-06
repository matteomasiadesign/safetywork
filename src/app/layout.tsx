import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Bricolage_Grotesque } from "next/font/google";
import { COMPANY_CONFIG } from "@/config/company";
import SiteFloatingContact from "@/components/ui/SiteFloatingContact";
import { getSiteContent } from "@/lib/data/content";
import { CONTENT_DEFAULTS } from "@/lib/content/schema";
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

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#008e97",
  width: "device-width",
  initialScale: 1,
};

/** L'icona della scheda è il logo scelto in admin; se i contenuti non si leggono resta quella originale. */
async function getLogoUrl(): Promise<string> {
  try {
    return (await getSiteContent())["brand.logo"];
  } catch {
    return CONTENT_DEFAULTS["brand.logo"];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const logo = await getLogoUrl();
  return {
    title: `${COMPANY_CONFIG.name} | ${COMPANY_CONFIG.tagline}`,
    description: COMPANY_CONFIG.description,
    keywords: [
      "Safety Works",
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
    icons: {
      icon: logo,
      apple: logo,
    },
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning className={`scroll-smooth ${plusJakarta.variable} ${inter.variable} ${bricolage.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-brand-cyan selection:text-white font-sans antialiased">
        {children}
        <SiteFloatingContact />
      </body>
    </html>
  );
}

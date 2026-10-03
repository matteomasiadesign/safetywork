import type { Metadata } from "next";
import { COMPANY_CONFIG } from "@/config/company";

export const metadata: Metadata = {
  title: `Pannello Amministrazione | ${COMPANY_CONFIG.name}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { SiteContent } from "./schema";

/** Recapiti pronti all'uso: il link di chiamata deriva dal numero scritto dal cliente. */
export interface CompanyContacts {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  hours: string;
}

export function companyContacts(content: Pick<SiteContent, "company.phone" | "company.email" | "company.address" | "company.hours">): CompanyContacts {
  const phone = content["company.phone"];
  return {
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
    email: content["company.email"],
    address: content["company.address"],
    hours: content["company.hours"],
  };
}

/** Numero WhatsApp (solo cifre, con prefisso internazionale) ricavato dal telefono aziendale. */
export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("00") ? digits.slice(2) : digits.length === 10 ? `39${digits}` : digits;
}

/** "99,4%" → { end: 99.4, decimals: 1, suffix: "%" }; "25000+" → { end: 25000, decimals: 0, suffix: "+" }. */
export function parseCounter(value: string): { end: number; decimals: number; suffix: string } | null {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;

  const [, number, suffix] = match;
  const normalized = number.replace(",", ".");
  const end = Number(normalized);
  if (!Number.isFinite(end)) return null;

  const decimals = normalized.includes(".") ? normalized.split(".")[1].length : 0;
  return { end, decimals, suffix };
}

/** "25k+" → ["25k", "+"]: il simbolo finale viene colorato a parte. */
export function splitTrailingSymbol(value: string): [string, string] {
  const match = value.trim().match(/^(.*?)([+%]*)$/);
  return match ? [match[1], match[2]] : [value, ""];
}

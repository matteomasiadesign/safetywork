import type { ServiceItem, ServiceBadgeColor } from "@/lib/types/database";
import type { Json, Tables } from "@/lib/types/supabase";

const BADGE_COLORS: ServiceBadgeColor[] = ["cyan", "orange", "red"];

export function parseDeliverables(value: Json): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** Riga della tabella services → forma usata dall'interfaccia (deliverables come array di testi). */
export function toServiceItem(row: Tables<"services">): ServiceItem {
  return {
    ...row,
    deliverables: parseDeliverables(row.deliverables),
    badge_color: BADGE_COLORS.includes(row.badge_color as ServiceBadgeColor)
      ? (row.badge_color as ServiceBadgeColor)
      : "cyan",
  };
}

import React from "react";

interface BrandStripeProps {
  height?: string;
  className?: string;
  cyanWidth?: string;
  orangeWidth?: string;
  redWidth?: string;
  rounded?: string;
}

/**
 * Fascia geometrica a tre colori identitari di Safety Works:
 * - Cyan Istituzionale (#008e97, 50%): Conformità normativa, perizie e D.Lgs. 81/08
 * - Arancione Sicurezza (#f58220, 30%): Prevenzione cantieri, formazione e DPI
 * - Rosso Emergenza (#df0000, 20%): Antincendio, primo soccorso e urgenze
 */
export default function BrandStripe({
  height = "h-1.5",
  className = "",
  cyanWidth = "w-[50%]",
  orangeWidth = "w-[30%]",
  redWidth = "w-[20%]",
  rounded = "",
}: BrandStripeProps) {
  return (
    <div
      className={`w-full flex shrink-0 overflow-hidden ${height} ${rounded} ${className}`}
      aria-hidden="true"
    >
      <div
        className={`${cyanWidth} bg-[#008e97] transition-all`}
        title="Cyan Istituzionale (Conformità D.Lgs. 81/08)"
      />
      <div
        className={`${orangeWidth} bg-[#f58220] transition-all`}
        title="Arancione Sicurezza (Prevenzione & Cantieri)"
      />
      <div
        className={`${redWidth} bg-[#df0000] transition-all`}
        title="Rosso Emergenza (Antincendio & Urgenze)"
      />
    </div>
  );
}


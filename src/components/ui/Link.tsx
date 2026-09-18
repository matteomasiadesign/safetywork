"use client";

import React from "react";
import NextLink from "next/link";

export interface CustomLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string;
  to?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Link: React.FC<CustomLinkProps> = ({
  href,
  to,
  className,
  children,
  ...props
}) => {
  const destination = to || href || "#";

  // Link esterni o protocolli (tel, mailto, ecc.)
  if (
    destination.startsWith("http://") ||
    destination.startsWith("https://") ||
    destination.startsWith("tel:") ||
    destination.startsWith("mailto:")
  ) {
    return (
      <a href={destination} className={className} {...props}>
        {children}
      </a>
    );
  }

  // Gestione ancore sulla stessa pagina o root (es. #corsi o /#corsi)
  if (destination.startsWith("/#") || destination.startsWith("#")) {
    const hash = destination.startsWith("/#")
      ? destination.substring(1)
      : destination;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Se siamo sulla root "/", scrolliamo dolcemente verso l'elemento
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        const targetId = hash.replace("#", "");
        const elem = document.getElementById(targetId);
        if (elem) {
          e.preventDefault();
          elem.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", hash);
        }
      }
    };

    return (
      <NextLink
        href={destination}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </NextLink>
    );
  }

  return (
    <NextLink href={destination} className={className} {...props}>
      {children}
    </NextLink>
  );
};

export default Link;

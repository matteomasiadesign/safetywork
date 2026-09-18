/**
 * Configurazione Dati Aziendali Safety Work S.r.l.s.
 * Unico punto di verità per anagrafica, recapiti e riferimenti legali.
 */
export const COMPANY_CONFIG = {
  name: "Safety Work S.r.l.s.",
  tagline: "Sicurezza & Igiene nei Luoghi di Lavoro",
  description:
    "Società specializzata in consulenza strategica, formazione accreditata D.Lgs. 81/08 e progettazione antincendio per la tutela della salute e sicurezza nei luoghi di lavoro.",
  piva: "03064430906",
  cf: "03064430906",
  rea: "SS-224190",
  headquarters: {
    address: "Corso Vittorio Emanuele, 56",
    city: "Porto Torres",
    province: "SS",
    postalCode: "07046",
    country: "Italia",
    fullAddress: "Corso Vittorio Emanuele, 56 - 07046 Porto Torres (SS)",
  },
  contacts: {
    phone: "+39 350 597 3817",
    phoneClean: "+393505973817",
    email: "safety.works.srls@gmail.com",
    pec: "safetyworks@pec.it",
  },
  socials: {
    linkedin: "https://www.linkedin.com/company/safety-work-srls",
  },
  accreditation: {
    norm: "D.Lgs. 81/08 e s.m.i.",
    stateRegionsAgreement: "Accordo Stato-Regioni 07/07/2016",
  },
} as const;


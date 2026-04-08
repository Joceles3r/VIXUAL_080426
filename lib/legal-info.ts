/**
 * VIXUAL -- Informations legales centralisees.
 *
 * Tous les textes legaux (CGU, CGV, Privacy, Cookies)
 * importent cet objet pour garantir la coherence.
 *
 * A completer avant la mise en production (les champs "________"
 * sont des placeholders pre-immatriculation).
 */
export const LEGAL_INFO = {
  formeJuridique: "SAS",
  denomination: "VIXUAL",
  capitalSocial: "________ \u20ac",
  siret: "________ ________ ________",
  rcs: "RCS ________",
  tva: "FR__ __________",
  adresseSiege:
    "________________________, _____ ________ ______, France",
  telephone: "+__ _ __ __ __ __",
  emailContact: "contact@visual-platform.com",
  emailSupport: "support@visual-platform.com",
  emailDPO: "dpo@visual-platform.com",
  directeurPublication: "________ ________",
  hebergeur: "Vercel Inc. \u2014 340 S Lemon Ave, Walnut, CA 91789, USA",
} as const;

export type LegalInfo = typeof LEGAL_INFO;

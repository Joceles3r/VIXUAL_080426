/**
 * VIXUAL Runtime Flags
 * 
 * Centralise tous les flags de runtime pour separer mock/demo de production.
 * En production, tous les mocks sont desactives par defaut.
 * 
 * REGLE PRODUIT:
 * - Tout ce qui est mock doit etre derriere un feature flag explicite
 * - Par defaut en environnement prod: aucun mock actif
 * - Toute page admin sensible doit afficher sa source reelle
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const runtimeFlags = {
  // Auth mock - JAMAIS en production
  allowMockAuth: 
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" && !IS_PRODUCTION,
  
  // Stripe dashboard mock - dev only
  allowMockStripeDashboard: 
    process.env.NEXT_PUBLIC_USE_MOCK_STRIPE_DASHBOARD === "true" && !IS_PRODUCTION,
  
  // Creator stats mock - dev only  
  allowMockCreatorStats: 
    process.env.NEXT_PUBLIC_USE_MOCK_CREATOR_STATS === "true" && !IS_PRODUCTION,
  
  // Social features mock - dev only
  allowMockSocial: 
    process.env.NEXT_PUBLIC_USE_MOCK_SOCIAL === "true" && !IS_PRODUCTION,
  
  // Upload mock - dev only
  allowMockUpload: 
    process.env.NEXT_PUBLIC_USE_MOCK_UPLOAD === "true" && !IS_PRODUCTION,
  
  // Video player mock - dev only
  allowMockVideo: 
    process.env.NEXT_PUBLIC_USE_MOCK_VIDEO === "true" && !IS_PRODUCTION,
  
  // Trust score mock - dev only
  allowMockTrustScore: 
    process.env.NEXT_PUBLIC_USE_MOCK_TRUST_SCORE === "true" && !IS_PRODUCTION,
    
  // Force database usage (refuse memory fallback)
  requireDatabaseForStripe:
    process.env.REQUIRE_DATABASE_FOR_STRIPE === "true" || IS_PRODUCTION,
} as const;

/**
 * Type pour les sources de donnees
 */
export type DataSource = "database" | "memory" | "mock" | "stripe" | "bunny" | "env";

/**
 * Helper pour verifier si on est en mode production
 */
export function isProduction(): boolean {
  return IS_PRODUCTION;
}

/**
 * Helper pour verifier si un mock specifique est autorise
 */
export function isMockAllowed(mockType: keyof typeof runtimeFlags): boolean {
  return runtimeFlags[mockType] === true;
}

/**
 * Helper pour obtenir un label source lisible
 */
export function getSourceLabel(source: DataSource): string {
  const labels: Record<DataSource, string> = {
    database: "Base de donnees",
    memory: "Memoire volatile",
    mock: "Donnees simulees",
    stripe: "Stripe API",
    bunny: "Bunny.net API",
    env: "Variables d'environnement",
  };
  return labels[source] || source;
}

/**
 * Validation: refuse l'execution si mock en production
 */
export function assertNotMockInProduction(mockName: string): void {
  if (IS_PRODUCTION) {
    throw new Error(
      `[VIXUAL Security] Mock "${mockName}" cannot be used in production environment.`
    );
  }
}

/**
 * VIXUAL Homepage Variants Configuration
 * ══════════════════════════════════════════════════════════════════════════════
 * Manages different homepage versions (V1 HBO Dark, V2 Preserved, etc.)
 * and their customization options.
 */

export type HomepageVariant = 'v1-hbo-dark' | 'v2-preserved' | 'v1-original' | 'v3-default'

export interface HomepageVariantConfig {
  id: HomepageVariant
  name: string
  description: string
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  features: string[]
  minVersion: 'V1' | 'V2' | 'V3'
  isActive: boolean
}

export const HOMEPAGE_VARIANTS: Record<HomepageVariant, HomepageVariantConfig> = {
  'v1-hbo-dark': {
    id: 'v1-hbo-dark',
    name: 'V1 HBO Dark Style',
    description: 'Premium cinema dark theme inspired by HBO with silver accents and dark red CTAs',
    palette: {
      primary: '#8B0000',
      secondary: '#C0C0C0',
      accent: '#F5F5F5',
      background: '#0A0A0A',
      text: '#F5F5F5',
    },
    features: [
      'Premium cinema aesthetic',
      '3 Featured images (Familles, Télécommande, Urne)',
      'Dark red CTA buttons',
      'Silver accent borders',
      'Film grain background texture',
      'Trending projects carousel',
      'Creator/Contributor/Public sections',
      'Detailed differentiation messaging',
    ],
    minVersion: 'V1',
    isActive: true,
  },
  'v2-preserved': {
    id: 'v2-preserved',
    name: 'V2 Preserved',
    description: 'Original V1 homepage preserved with V2 navbar tabs added',
    palette: {
      primary: '#e50914',
      secondary: '#b91c1c',
      accent: '#ef4444',
      background: '#0a0a0f',
      text: '#ffffff',
    },
    features: [
      'Original V1 hero section',
      'Original 3 carousels (Films, Podcasts, Books)',
      'Original Savoir & Culture section',
      'V2 Navbar tabs (Dashboard, Projets, etc.)',
      'Trust Score integration',
      'VIXUpoints system',
      'Netflix-style red cinema accents',
      'Backward compatible styling',
    ],
    minVersion: 'V2',
    isActive: true,
  },
  'v1-original': {
    id: 'v1-original',
    name: 'V1 Original',
    description: 'Original V1 homepage with purple fuchsia theme',
    palette: {
      primary: '#d946ef',
      secondary: '#a855f7',
      accent: '#f0abfc',
      background: '#0a0118',
      text: '#ffffff',
    },
    features: [
      'Purple fuchsia glow effects',
      'Futuristic neon styling',
      'Embla carousel system',
      'Premium streaming layout',
      'Original V1 sections',
    ],
    minVersion: 'V1',
    isActive: false,
  },
  'v3-default': {
    id: 'v3-default',
    name: 'V3 Default',
    description: 'V3 default theme with emerald/teal accents',
    palette: {
      primary: '#10b981',
      secondary: '#14b8a6',
      accent: '#34d399',
      background: '#0f172a',
      text: '#ffffff',
    },
    features: [
      'Emerald/teal color scheme',
      'Full V3 feature set',
      'Advanced customization',
      'Trust Score V2',
      'Enhanced dashboard',
    ],
    minVersion: 'V3',
    isActive: false,
  },
}

export function getActiveHomepageVariant(): HomepageVariantConfig {
  const activeVariant = Object.values(HOMEPAGE_VARIANTS).find((v) => v.isActive)
  return activeVariant || HOMEPAGE_VARIANTS['v2-preserved']
}

export function getHomepageVariant(id: HomepageVariant): HomepageVariantConfig | undefined {
  return HOMEPAGE_VARIANTS[id]
}

export function getVariantsByVersion(version: 'V1' | 'V2' | 'V3'): HomepageVariantConfig[] {
  const versionOrder = { V1: 1, V2: 2, V3: 3 }
  return Object.values(HOMEPAGE_VARIANTS).filter(
    (v) => versionOrder[version] >= versionOrder[v.minVersion]
  )
}

export function getVariantLabel(id: HomepageVariant): string {
  const variant = HOMEPAGE_VARIANTS[id]
  return variant ? `${variant.name} - ${variant.description}` : 'Unknown'
}

export interface VariantCustomization {
  variantId: HomepageVariant
  heroImageUrl?: string
  customColorsOverride?: boolean
  customPalette?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    text?: string
  }
  enabledFeatures?: string[]
  sectionOrder?: string[]
  ctaText?: string
  ctaHref?: string
}

export const DEFAULT_CUSTOMIZATIONS: Record<HomepageVariant, VariantCustomization> = {
  'v1-hbo-dark': {
    variantId: 'v1-hbo-dark',
    customColorsOverride: false,
    enabledFeatures: [
      'Premium cinema aesthetic',
      '3 Featured images',
      'Trending projects carousel',
      'Creator sections',
    ],
    sectionOrder: ['hero', 'how-it-works', 'images', 'carousel', 'creators', 'differentiation', 'cta'],
  },
  'v2-preserved': {
    variantId: 'v2-preserved',
    customColorsOverride: false,
    enabledFeatures: [
      'Original V1 hero',
      'Original carousels',
      'V2 Navbar',
      'Trust Score',
      'VIXUpoints',
    ],
    sectionOrder: ['navbar', 'hero', 'carousels', 'savoir-culture', 'cta'],
    ctaText: 'Commencer gratuitement',
    ctaHref: '/welcome',
  },
  'v1-original': {
    variantId: 'v1-original',
    customColorsOverride: false,
    enabledFeatures: [
      'Purple fuchsia glow',
      'Futuristic neon',
      'Embla carousel',
      'Premium streaming',
    ],
    sectionOrder: ['hero', 'carousels', 'savoir-culture', 'cta'],
  },
  'v3-default': {
    variantId: 'v3-default',
    customColorsOverride: false,
    enabledFeatures: [
      'Emerald/teal theme',
      'Full V3 features',
      'Advanced customization',
      'Trust Score V2',
    ],
    sectionOrder: ['hero', 'stats', 'carousels', 'features', 'cta'],
  },
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: V2 Navigation Tabs
 * ═════════════════════════════════════════════════════════════════════════════
 * Returns configuration for V2 navbar tabs.
 * Used by home-v2-preserved.tsx component.
 */

export interface V2NavTab {
  label: string
  href: string
  icon: string
  description: string
  minVersion: 'V1' | 'V2' | 'V3'
}

const V2_NAV_TABS: V2NavTab[] = [
  {
    label: "Dashboard V2",
    href: "/dashboard",
    icon: "BarChart3",
    description: "Tableau de bord V2 avec statistiques avancées",
    minVersion: "V2",
  },
  {
    label: "Projets V2",
    href: "/explore",
    icon: "Play",
    description: "Explorateur de projets V2 optimisé",
    minVersion: "V2",
  },
  {
    label: "Contributeurs V2",
    href: "/top-contributors",
    icon: "Users",
    description: "Classement des contributeurs V2",
    minVersion: "V2",
  },
  {
    label: "Créateurs V2",
    href: "/guide-profiles",
    icon: "Crown",
    description: "Guide des créateurs et profils V2",
    minVersion: "V2",
  },
  {
    label: "Trust Score",
    href: "/trust-score",
    icon: "Star",
    description: "Système de notation de confiance",
    minVersion: "V2",
  },
  {
    label: "VIXUpoints",
    href: "/dashboard/vixupoints",
    icon: "Sparkles",
    description: "Gestion des VIXUpoints",
    minVersion: "V1",
  },
  {
    label: "Paramètres V2",
    href: "/dashboard/settings",
    icon: "Settings",
    description: "Paramètres utilisateur V2",
    minVersion: "V2",
  },
]

export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version') || 'V2'

    // Filter tabs by version
    const filteredTabs = V2_NAV_TABS.filter((tab) => {
      const versions = { V1: 1, V2: 2, V3: 3 }
      return versions[version as keyof typeof versions] >= versions[tab.minVersion]
    })

    return NextResponse.json({
      success: true,
      version,
      tabs: filteredTabs,
      totalCount: filteredTabs.length,
    })
  } catch (error) {
    console.error('[V2 Navbar API Error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch V2 navbar tabs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tabOrder, enabledTabs } = body

    // Validate tab order
    if (!Array.isArray(tabOrder)) {
      return NextResponse.json(
        { success: false, error: 'tabOrder must be an array' },
        { status: 400 }
      )
    }

    // Store configuration (in real app, save to database or cache)
    const customConfig = {
      tabOrder,
      enabledTabs,
      timestamp: new Date().toISOString(),
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'V2 navbar configuration updated',
      config: customConfig,
    })
  } catch (error) {
    console.error('[V2 Navbar API Error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update V2 navbar configuration' },
      { status: 500 }
    )
  }
}

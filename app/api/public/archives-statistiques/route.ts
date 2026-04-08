import { NextResponse } from "next/server"
import { 
  getPublicArchivesAndStats, 
  getCurrentTopProjects, 
  getBestProgressions,
  getHallOfFameProjects,
  getPrestigeArchivesByPeriod,
  buildPublicGlobalStats
} from "@/lib/archives-statistics/engine"

/**
 * GET /api/public/archives-statistiques
 * 
 * Public API endpoint for archives and statistics
 * Accessible without authentication (for guests)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get("view") || "full"
    const category = searchParams.get("category") as "video" | "text" | "podcast" | undefined
    const limit = parseInt(searchParams.get("limit") || "10")
    
    switch (view) {
      case "top":
        // Get current top projects
        const topProjects = getCurrentTopProjects(limit, category)
        return NextResponse.json({
          success: true,
          data: { projects: topProjects },
        })
        
      case "progressions":
        // Get best progressions
        const progressions = getBestProgressions(limit)
        return NextResponse.json({
          success: true,
          data: { projects: progressions },
        })
        
      case "hall-of-fame":
        // Get hall of fame
        const hallOfFame = getHallOfFameProjects()
        return NextResponse.json({
          success: true,
          data: { projects: hallOfFame },
        })
        
      case "archives":
        // Get archives by period
        const archives = getPrestigeArchivesByPeriod()
        return NextResponse.json({
          success: true,
          data: { archives },
        })
        
      case "stats":
        // Get global stats only
        const stats = buildPublicGlobalStats()
        return NextResponse.json({
          success: true,
          data: { stats },
        })
        
      case "full":
      default:
        // Get everything
        const fullData = await getPublicArchivesAndStats()
        return NextResponse.json({
          success: true,
          data: fullData,
        })
    }
  } catch (error) {
    console.error("[API] Error fetching public archives:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la recuperation des archives" },
      { status: 500 }
    )
  }
}

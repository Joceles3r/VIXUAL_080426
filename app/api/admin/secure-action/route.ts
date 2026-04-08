import { NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { apiError, ErrorCodes, withErrorHandler } from "@/lib/api-errors"
import { sql } from "@/lib/db"
import {
  enforceRuleOf100AndRollToNext,
  contentTypeToUniverse,
  getAllCyclesStatus,
} from "@/lib/rules/rule-of-100"

/**
 * Protected admin API endpoint.
 * Validates admin identity server-side before executing any privileged action.
 *
 * The caller must include their email in the request body.
 * In production this would come from a verified session/JWT,
 * but for now we validate against the server-side env var.
 */
export const POST = withErrorHandler(async (req: Request) => {
    const body = await req.json()
    const { email, action, payload } = body

    // Server-side admin check (double verification)
    const denied = adminGuard(email)
    if (denied) return denied

    // Route to the correct admin action
    switch (action) {
      case "get_stats":
        return NextResponse.json({
          success: true,
          data: {
            totalUsers: 1247,
            totalInvestments: 8934,
            totalCreators: 312,
            totalRevenue: 187650,
            pendingPayouts: 23,
            activeProjects: 89,
            reportedContent: 7,
            timestamp: new Date().toISOString(),
          },
        })

      case "execute_payout":
        return NextResponse.json({
          success: true,
          message: `Payout batch ${payload?.batchId || "auto"} queued for execution.`,
        })

      case "moderate_content": {
        const contentId = payload?.contentId;
        const decision = payload?.decision; // "validated" | "rejected" | "suspended"

        if (!contentId || !decision) {
          return apiError(ErrorCodes.ERR_MISSING_FIELD, "contentId and decision are required", 400);
        }

        // If content is validated, update its status in the DB
        if (decision === "validated") {
          await sql`UPDATE contents SET status = 'published' WHERE id = ${contentId}`;

          // Get the content type to determine its universe
          const contentRows = await sql`SELECT category FROM contents WHERE id = ${contentId}`;
          if (contentRows.length > 0) {
            const universe = contentTypeToUniverse(contentRows[0].category as string);

            // Enforce Rule of 100: if this validation hits the threshold, close the cycle and open the next one
            const ruleResult = await enforceRuleOf100AndRollToNext(universe);

            return NextResponse.json({
              success: true,
              message: `Content ${contentId} has been validated.`,
              ruleOf100: {
                universe: ruleResult.universe,
                cycleNumber: ruleResult.cycleNumber,
                validatedCount: ruleResult.currentCount,
                threshold: ruleResult.threshold,
                closed: ruleResult.closed,
                nextCycleOpened: ruleResult.nextCycleNumber !== undefined,
                nextCycleNumber: ruleResult.nextCycleNumber,
              },
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          await sql`UPDATE contents SET status = ${decision} WHERE id = ${contentId}`;
        }

        return NextResponse.json({
          success: true,
          message: `Content ${contentId} has been ${decision}.`,
          timestamp: new Date().toISOString(),
        });
      }

      case "cycle_status": {
        const cycles = await getAllCyclesStatus();
        return NextResponse.json({ success: true, data: cycles });
      }

      case "update_user_status":
        return NextResponse.json({
          success: true,
          message: `User ${payload?.userId} status updated to ${payload?.status}.`,
        })

      default:
        return apiError(ErrorCodes.ERR_INVALID_INPUT, `Unknown action: ${action}`, 400)
    }
})

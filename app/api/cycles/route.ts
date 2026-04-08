import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/api-errors";
import { getAllCyclesStatus } from "@/lib/rules/rule-of-100";

/**
 * GET /api/cycles
 *
 * Returns the current status of all universe cycles (Rule of 100).
 * Public read -- no auth required (dashboard visibility for all users).
 */
export const GET = withErrorHandler(async () => {
  const cycles = await getAllCyclesStatus();

  // Compute summary
  const summary = {
    totalCycles: cycles.length,
    openCycles: cycles.filter((c: { status: string }) => c.status === "open").length,
    closedCycles: cycles.filter((c: { status: string }) => c.status === "closed").length,
    universes: [...new Set(cycles.map((c: { universe: string }) => c.universe))],
  };

  return NextResponse.json({
    success: true,
    summary,
    cycles,
    timestamp: new Date().toISOString(),
  });
});

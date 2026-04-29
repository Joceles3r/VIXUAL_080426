import { pointsToVisibilityScore } from "@/lib/visibility-boost/engine"

export function simulateVisibilityDistribution(visitorCount: number, creatorCount: number, avgPointsPerSupport: number): { creatorScores: number[]; giniCoefficient: number; concentration: number } {
  const scores = new Array(creatorCount).fill(0)
  for (let v = 0; v < visitorCount; v++) {
    const trust = 50 + Math.random() * 50
    const targetCreator = Math.floor(Math.pow(Math.random(), 2) * creatorCount) // power law
    const points = avgPointsPerSupport + (Math.random() - 0.5) * 20
    scores[targetCreator] += pointsToVisibilityScore(Math.max(10, Math.min(50, points)), trust)
  }
  scores.sort((a, b) => b - a)
  const total = scores.reduce((s, x) => s + x, 0)
  const top10share = scores.slice(0, Math.floor(creatorCount * 0.1)).reduce((s, x) => s + x, 0) / Math.max(total, 1)
  const gini = computeGini(scores)
  return { creatorScores: scores, giniCoefficient: gini, concentration: top10share }
}

function computeGini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  if (n === 0) return 0
  let sumOfDifferences = 0; let sumOfValues = 0
  for (let i = 0; i < n; i++) { sumOfDifferences += (2 * (i + 1) - n - 1) * sorted[i]; sumOfValues += sorted[i] }
  return sumOfValues === 0 ? 0 : sumOfDifferences / (n * sumOfValues)
}

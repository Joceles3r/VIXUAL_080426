/**
 * MODULE TEST-LAB VIXUAL — SIMULATEUR BUNNY (mock)
 * Aucune requete reelle a Bunny.net.
 * SECURITE : si VIXUAL_TEST_LAB_ALLOW_REAL_BUNNY !== "true", tout est mock.
 */

import type { TestBunnyMode, TestProject } from "./types"

/** Verifie si le mode mock est force (par defaut : oui). */
function isBunnyMockForced(): boolean {
  return process.env.VIXUAL_TEST_LAB_ALLOW_REAL_BUNNY !== "true"
}

export function simulateBunnyStatus(
  project: TestProject,
  status: TestBunnyMode,
): TestProject {
  if (project.type !== "video") return project

  // SECURITE : forcer le mode mock
  const finalStatus = isBunnyMockForced() ? "mock" as TestBunnyMode : status

  return {
    ...project,
    bunnyStatus: finalStatus,
    url:
      finalStatus === "ready"
        ? project.url ?? "/videos/demo1.mp4"
        : finalStatus === "processing"
          ? undefined
          : project.url,
  }
}

export function simulateBunnyProcessing(projects: TestProject[]): TestProject[] {
  const statuses: TestBunnyMode[] = ["processing", "ready", "error"]
  return projects.map((project, index) => {
    if (project.type !== "video") return project
    return simulateBunnyStatus(project, statuses[index % statuses.length])
  })
}

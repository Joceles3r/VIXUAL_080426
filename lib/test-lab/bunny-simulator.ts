/**
 * MODULE TEST-LAB VIXUAL — SIMULATEUR BUNNY (mock)
 * Aucune requete reelle a Bunny.net.
 */

import type { TestBunnyMode, TestProject } from "./types"

export function simulateBunnyStatus(
  project: TestProject,
  status: TestBunnyMode,
): TestProject {
  if (project.type !== "video") return project

  return {
    ...project,
    bunnyStatus: status,
    url:
      status === "ready"
        ? project.url ?? "/videos/demo1.mp4"
        : status === "processing"
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

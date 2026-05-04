/**
 * MODULE TEST-LAB VIXUAL — GENERATEUR DE CONTENUS
 * Aucune ecriture reelle dans la table contents/projects.
 */

import type { TestProject, TestUser } from "./types"

export function generateTestProjects(
  config: {
    videos: number
    podcasts: number
    articles: number
  },
  users: TestUser[],
): TestProject[] {
  const creators = users.filter((u) => u.role === "creator")
  const fallbackCreator = creators[0]

  if (!fallbackCreator) return []

  const projects: TestProject[] = []

  for (let i = 0; i < config.videos; i++) {
    projects.push({
      id: `test_video_${i}`,
      title: `Video test VIXUAL ${i + 1}`,
      type: "video",
      creatorId: creators[i % creators.length]?.id ?? fallbackCreator.id,
      url: `/videos/demo${(i % 3) + 1}.mp4`,
      bunnyStatus: "mock",
    })
  }

  for (let i = 0; i < config.podcasts; i++) {
    projects.push({
      id: `test_audio_${i}`,
      title: `Podcast test VIXUAL ${i + 1}`,
      type: "audio",
      creatorId: creators[i % creators.length]?.id ?? fallbackCreator.id,
      url: `/audio/demo${(i % 3) + 1}.mp3`,
      bunnyStatus: "mock",
    })
  }

  for (let i = 0; i < config.articles; i++) {
    projects.push({
      id: `test_article_${i}`,
      title: `Article test VIXUAL ${i + 1}`,
      type: "article",
      creatorId: creators[i % creators.length]?.id ?? fallbackCreator.id,
      content: "Contenu ecrit de test pour valider l'experience VIXUAL.",
    })
  }

  return projects
}

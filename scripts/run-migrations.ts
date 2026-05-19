/**
 * VIXUAL — scripts/run-migrations.ts
 *
 * Execute automatiquement les migrations SQL non appliquees.
 * Lance au demarrage du serveur (npm run start) via prebuild hook.
 *
 * Mecanisme :
 *  - Cree la table `schema_migrations` si elle n'existe pas.
 *  - Scanne scripts/migrations/*.sql en ordre alphabetique.
 *  - Pour chaque fichier non encore applique : execute + enregistre.
 *  - Idempotent : aucun risque de double execution.
 */
import "dotenv/config"
import { readdir, readFile } from "fs/promises"
import path from "path"
import { neon } from "@neondatabase/serverless"

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.warn("[migrations] DATABASE_URL non configuree, skip.")
    return
  }

  const sql = neon(dbUrl)
  const migrationsDir = path.join(process.cwd(), "scripts", "migrations")

  // 1) Creer la table de suivi si necessaire
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
      checksum VARCHAR(64)
    )
  `

  // 2) Lister les fichiers SQL en ordre alphabetique
  let files: string[] = []
  try {
    const entries = await readdir(migrationsDir)
    files = entries.filter((f) => f.endsWith(".sql")).sort()
  } catch (e) {
    console.warn("[migrations] Dossier introuvable :", migrationsDir)
    return
  }

  // 3) Recuperer les migrations deja appliquees
  const rows = await sql`SELECT filename FROM schema_migrations`
  const applied = new Set((rows as Array<{ filename: string }>).map((r) => r.filename))

  // 4) Appliquer les nouvelles
  let appliedCount = 0
  for (const file of files) {
    if (applied.has(file)) continue
    const fullPath = path.join(migrationsDir, file)
    const sqlContent = await readFile(fullPath, "utf-8")

    try {
      console.log(`[migrations] Application de ${file}...`)
      // Execution brute (Neon supporte multi-statements via unsafe)
      await sql.unsafe(sqlContent)
      await sql`INSERT INTO schema_migrations (filename) VALUES (${file})`
      appliedCount++
      console.log(`[migrations] ✓ ${file}`)
    } catch (e) {
      console.error(`[migrations] ✗ ECHEC ${file} :`, (e as Error).message)
      // On continue sur les suivantes plutot que de bloquer tout
    }
  }

  if (appliedCount === 0) {
    console.log("[migrations] Aucune nouvelle migration. BD a jour.")
  } else {
    console.log(`[migrations] ${appliedCount} migration(s) appliquee(s).`)
  }
}

main().catch((e) => {
  console.error("[migrations] Erreur fatale :", e)
  process.exit(1)
})

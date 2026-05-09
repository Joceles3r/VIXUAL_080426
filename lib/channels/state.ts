/**
 * Etat global du module "Chaines createurs" (V3, OFF par defaut).
 *
 * Le module est:
 * - desactive par defaut (creator_channels_state.is_enabled = FALSE)
 * - active uniquement par le PATRON via /admin/creator-channels
 * - lu par toutes les routes API et les pages publiques pour decider
 *   si le module est visible / utilisable
 *
 * Garde-fous :
 * - le flag de feature creatorChannels (lib/feature-flags) doit etre ON
 *   ET la version plateforme doit etre V3 ET la BDD doit etre is_enabled
 */

import "server-only"
import { sql } from "@/lib/db"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { getPlatformVersion } from "@/lib/platform/version"

export interface CreatorChannelsState {
  isEnabled: boolean
  enabledAt: Date | null
  enabledBy: string | null
  disabledAt: Date | null
  disabledBy: string | null
}

/**
 * Retourne l'etat brut du module en BDD.
 */
export async function getCreatorChannelsState(): Promise<CreatorChannelsState> {
  const rows = await sql`
    SELECT is_enabled, enabled_at, enabled_by, disabled_at, disabled_by
    FROM creator_channels_state
    WHERE id = 1
  `
  const row = rows[0]
  if (!row) {
    return {
      isEnabled: false,
      enabledAt: null,
      enabledBy: null,
      disabledAt: null,
      disabledBy: null,
    }
  }
  return {
    isEnabled: Boolean(row.is_enabled),
    enabledAt: row.enabled_at ? new Date(row.enabled_at) : null,
    enabledBy: row.enabled_by ?? null,
    disabledAt: row.disabled_at ? new Date(row.disabled_at) : null,
    disabledBy: row.disabled_by ?? null,
  }
}

/**
 * Verification complete : module utilisable cote utilisateur ?
 *
 * Le module n'est utilisable que si :
 * 1. Le feature flag "creatorChannels" est ON (env ENABLE_CREATOR_CHANNELS=true)
 * 2. La plateforme tourne en V3
 * 3. Le PATRON l'a bien active dans /admin/creator-channels
 */
export async function isCreatorChannelsModuleActive(): Promise<boolean> {
  if (!isFeatureEnabled("creatorChannels")) return false
  const version = await getPlatformVersion().catch(() => "V1" as const)
  if (version !== "V3") return false
  const state = await getCreatorChannelsState()
  return state.isEnabled
}

/**
 * Active le module (PATRON only). Trace l'utilisateur a l'origine.
 */
export async function enableCreatorChannelsModule(actorEmail: string): Promise<void> {
  await sql`
    UPDATE creator_channels_state
    SET
      is_enabled = TRUE,
      enabled_at = NOW(),
      enabled_by = ${actorEmail}
    WHERE id = 1
  `
}

/**
 * Desactive le module (PATRON only). Trace l'utilisateur a l'origine.
 */
export async function disableCreatorChannelsModule(actorEmail: string): Promise<void> {
  await sql`
    UPDATE creator_channels_state
    SET
      is_enabled = FALSE,
      disabled_at = NOW(),
      disabled_by = ${actorEmail}
    WHERE id = 1
  `
}

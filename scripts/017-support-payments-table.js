// Migration: Create support_payments table for VIXUAL donation system
// Run with: node scripts/017-support-payments-table.js

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function createSupportPaymentsTable() {
  console.log("Creating support_payments table...")

  await sql`
    CREATE TABLE IF NOT EXISTS support_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id VARCHAR(255), -- ID projet optionnel (pas de FK car table projects peut ne pas exister)
      project_title VARCHAR(500), -- Titre du projet pour reference
      amount INTEGER NOT NULL CHECK (amount >= 200), -- minimum 2€ en centimes
      fee INTEGER NOT NULL CHECK (fee >= 0), -- commission VIXUAL 15%
      net INTEGER NOT NULL CHECK (net > 0), -- montant net pour le créateur (85%)
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      stripe_payment_id VARCHAR(255),
      message TEXT, -- message optionnel du supporter
      anonymous BOOLEAN DEFAULT FALSE, -- don anonyme
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      -- Pas d'auto-don
      CONSTRAINT no_self_donation CHECK (user_id != creator_id)
    )
  `

  console.log("Creating indexes...")

  await sql`CREATE INDEX IF NOT EXISTS idx_support_user ON support_payments(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_support_creator ON support_payments(creator_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_support_project ON support_payments(project_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_support_status ON support_payments(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_support_created ON support_payments(created_at DESC)`

  console.log("support_payments table created successfully!")
}

createSupportPaymentsTable()
  .then(() => {
    console.log("Migration completed")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Migration failed:", err)
    process.exit(1)
  })

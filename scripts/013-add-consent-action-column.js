import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Adding consent_action and consented_at columns to cookie_consent_logs...");

  try {
    // Add consent_action column if it doesn't exist
    await sql`
      ALTER TABLE cookie_consent_logs 
      ADD COLUMN IF NOT EXISTS consent_action VARCHAR(20) DEFAULT 'accept'
    `;
    console.log("Added consent_action column");

    // Add consented_at column if it doesn't exist
    await sql`
      ALTER TABLE cookie_consent_logs 
      ADD COLUMN IF NOT EXISTS consented_at TIMESTAMP DEFAULT NOW()
    `;
    console.log("Added consented_at column");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();

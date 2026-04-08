import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function fixConsentActionLength() {
  console.log("Fixing consent_action column length...");

  try {
    // Alter the consent_action column to allow longer values
    // "necessary,preferences,analytics,marketing" = 40 characters
    await sql`
      ALTER TABLE cookie_consent_logs 
      ALTER COLUMN consent_action TYPE VARCHAR(100)
    `;
    
    console.log("Successfully updated consent_action column to VARCHAR(100)");
  } catch (error) {
    // If the column doesn't exist or table doesn't exist, create it properly
    if (error.message?.includes("does not exist")) {
      console.log("Table or column not found, creating table with correct schema...");
      
      await sql`
        CREATE TABLE IF NOT EXISTS cookie_consent_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          ip_hash VARCHAR(20),
          consent_action VARCHAR(100) NOT NULL,
          preferences JSONB NOT NULL,
          consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_cookie_consent_user_id 
        ON cookie_consent_logs(user_id)
      `;
      
      console.log("Created cookie_consent_logs table with correct schema");
    } else {
      throw error;
    }
  }

  console.log("Migration completed successfully!");
}

fixConsentActionLength().catch(console.error);

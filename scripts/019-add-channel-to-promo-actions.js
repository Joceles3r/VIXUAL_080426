import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function addChannelColumn() {
  try {
    // Add channel column to promo_actions table
    await sql`ALTER TABLE promo_actions ADD COLUMN IF NOT EXISTS channel VARCHAR(50)`;
    console.log("Successfully added 'channel' column to promo_actions table");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("Column 'channel' already exists - skipping");
    } else {
      console.error("Error adding column:", error.message);
      throw error;
    }
  }
}

addChannelColumn();

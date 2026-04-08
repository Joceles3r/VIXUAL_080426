import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Database connection with graceful fallback
 * Returns a mock function if DATABASE_URL is not configured
 */
function createDatabaseConnection(): NeonQueryFunction<false, false> {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.warn("[VIXUAL] DATABASE_URL not configured - using mock database");
    // Return a mock function that returns empty results
    const mockSql = (async () => []) as unknown as NeonQueryFunction<false, false>;
    mockSql.transaction = async () => [];
    return mockSql;
  }
  
  return neon(dbUrl);
}

export const sql = createDatabaseConnection();

/**
 * Check if database is configured
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

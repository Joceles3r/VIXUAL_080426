import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _connection: NeonQueryFunction<false, false> | null = null;
let _isConfigured: boolean | null = null;

/**
 * Get the database connection lazily (singleton pattern).
 * Avoids calling neon() at module level which causes build errors.
 */
function getDatabaseConnection(): NeonQueryFunction<false, false> {
  if (_connection !== null) {
    return _connection;
  }

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn("[VIXUAL] DATABASE_URL not configured - using mock database");
    // Return a mock function that returns empty results
    const mockSql = (async () => []) as unknown as NeonQueryFunction<false, false>;
    mockSql.transaction = async () => [];
    _connection = mockSql;
    _isConfigured = false;
    return _connection;
  }

  _connection = neon(dbUrl);
  _isConfigured = true;
  return _connection;
}

/**
 * Main database query function with lazy initialization.
 * Use this instead of calling neon() directly.
 * 
 * Supports both:
 * - Template literal calls: sql`SELECT * FROM users`
 * - Property access: sql.transaction(...)
 */
function createLazySql(): NeonQueryFunction<false, false> {
  // Create a callable function that delegates to the real connection
  const sqlFunction = function(strings: TemplateStringsArray, ...values: unknown[]) {
    const conn = getDatabaseConnection();
    return conn(strings, ...values);
  } as NeonQueryFunction<false, false>;

  // Add proxy to handle property access (like .transaction)
  return new Proxy(sqlFunction, {
    get(_target, prop) {
      const conn = getDatabaseConnection();
      const value = (conn as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === 'function') {
        return (value as (...args: unknown[]) => unknown).bind(conn);
      }
      return value;
    },
    apply(_target, _thisArg, args) {
      const conn = getDatabaseConnection();
      // Handle template literal call
      return (conn as unknown as (...args: unknown[]) => unknown)(...args);
    }
  });
}

export const sql = createLazySql();

/**
 * Check if database is configured
 */
export function isDatabaseConfigured(): boolean {
  // Initialize check on first call
  if (_isConfigured === null) {
    getDatabaseConnection();
  }
  return _isConfigured === true;
}

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";

/**
 * Run pending database migrations
 */
export async function runMigrations() {
  // Skip migrations if disabled via environment variable
  if (process.env.SKIP_MIGRATIONS === 'true') {
    console.log("[Migrations] Skipping migrations (SKIP_MIGRATIONS=true)");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.warn("[Migrations] DATABASE_URL not set, skipping migrations");
    return;
  }

  try {
    console.log("[Migrations] Starting database migrations...");
    
    const db = drizzle(process.env.DATABASE_URL);
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    
    await migrate(db, { migrationsFolder });
    
    console.log("[Migrations] Database migrations completed successfully");
  } catch (error) {
    console.error("[Migrations] Failed to run migrations:", error);
    // Don't throw, just log the error
  }
}

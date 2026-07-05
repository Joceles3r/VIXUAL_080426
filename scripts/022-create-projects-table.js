/**
 * VIXUAL V1-001 — Migration: Create Projects Table
 * 
 * Creates the `projects` table for the Creator Project Submission module (V1).
 * Supports statuses: draft, ready, pending, published, rejected
 * Includes media fields (excerptMedia, fullMedia) for future Bunny.net integration.
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function createProjectsTable() {
  console.log("═".repeat(60));
  console.log("VIXUAL V1-001 — Creating projects table migration");
  console.log("═".repeat(60));

  try {
    // ── 1. Create projects table ──
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        -- Basic info
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        description TEXT,
        
        -- Category/SubCategory
        category VARCHAR(50),
        sub_category VARCHAR(50),
        
        -- Media
        cover_image TEXT,
        excerpt_media TEXT,
        full_media TEXT,
        
        -- Pricing
        participation_price DECIMAL(10,2) DEFAULT 0.00,
        
        -- Status management
        status VARCHAR(50) NOT NULL DEFAULT 'draft'
          CHECK (status IN ('draft', 'ready', 'pending', 'published', 'rejected')),
        
        -- Moderation
        moderation_note TEXT,
        is_featured BOOLEAN DEFAULT false,
        
        -- Timestamps
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        published_at TIMESTAMPTZ,
        
        -- Ensure owner is a creator
        CONSTRAINT owner_must_exist CHECK (owner_id IS NOT NULL)
      )
    `;
    console.log("✓ Created projects table");

    // ── 2. Create indexes for performance ──
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published_at DESC)`;
    console.log("✓ Created indexes for projects table");

    // ── 3. Create projects_media_uploads table (for tracking media files) ──
    await sql`
      CREATE TABLE IF NOT EXISTS projects_media_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('excerpt', 'full')),
        file_name VARCHAR(500) NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        storage_url TEXT,
        storage_provider VARCHAR(50) DEFAULT 'local' CHECK (storage_provider IN ('local', 'bunny', 'aws')),
        status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploading', 'uploaded', 'failed', 'deleted')),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    console.log("✓ Created projects_media_uploads table");

    // ── 4. Create indexes for media table ──
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_media_project ON projects_media_uploads(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_media_type ON projects_media_uploads(media_type)`;
    console.log("✓ Created indexes for projects_media_uploads table");

    // ── 5. Add audit log table (for tracking project status changes) ──
    await sql`
      CREATE TABLE IF NOT EXISTS projects_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    console.log("✓ Created projects_audit_log table");

    // ── 6. Create index for audit log ──
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_audit_project ON projects_audit_log(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_audit_owner ON projects_audit_log(owner_id)`;
    console.log("✓ Created indexes for projects_audit_log table");

    console.log("");
    console.log("═".repeat(60));
    console.log("✅ V1-001 migration completed successfully!");
    console.log("═".repeat(60));
    console.log("");
    console.log("Tables created:");
    console.log("  • projects");
    console.log("  • projects_media_uploads");
    console.log("  • projects_audit_log");
    console.log("");
    console.log("Ready for project submission workflow.");
    console.log("");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

createProjectsTable()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

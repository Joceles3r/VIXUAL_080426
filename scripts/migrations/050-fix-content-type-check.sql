-- ═══════════════════════════════════════════════════════════════
-- Fix content_type CHECK constraint : ajout de 'podcast'
-- ═══════════════════════════════════════════════════════════════
-- Le schema 001-init-database.sql n'avait pas de CHECK sur content_type.
-- Le schema 001-create-schema.sql (deprecated) avait CHECK IN ('video', 'text').
-- Cette migration ajoute une contrainte CHECK propre incluant 'podcast'.

-- Supprime l'ancienne contrainte si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'contents' AND constraint_name = 'contents_content_type_check'
  ) THEN
    ALTER TABLE contents DROP CONSTRAINT contents_content_type_check;
  END IF;
END $$;

-- Ajoute la nouvelle contrainte avec les 3 types
ALTER TABLE contents
  ADD CONSTRAINT contents_content_type_check
  CHECK (content_type IN ('video', 'text', 'podcast'));

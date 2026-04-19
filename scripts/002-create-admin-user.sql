-- ═══════════════════════════════════════════════════════════════════════════
-- VIXUAL - Création/Réinitialisation de l'utilisateur ADMIN/PATRON
-- Email: jocelyndru@gmail.com
-- Mot de passe temporaire: Vixual2026!
-- Hash bcrypt (10 rounds): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ═══════════════════════════════════════════════════════════════════════════

-- Supprimer l'utilisateur existant s'il existe (reset complet)
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = 'jocelyndru@gmail.com');
DELETE FROM vixupoints_transactions WHERE user_id IN (SELECT id FROM users WHERE email = 'jocelyndru@gmail.com');
DELETE FROM users WHERE email = 'jocelyndru@gmail.com';

-- Créer l'utilisateur ADMIN/PATRON avec tous les privilèges
INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  role,
  is_verified,
  is_minor,
  is_creator,
  birth_date,
  vixupoints_balance,
  trust_score,
  stripe_customer_id,
  stripe_connect_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'jocelyndru@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Jocelyn (PATRON)',
  'admin',
  true,
  false,
  true,
  '1985-01-01',
  100000,
  100,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- Vérifier que l'utilisateur a bien été créé
SELECT 
  id,
  email,
  display_name,
  role,
  is_verified,
  vixupoints_balance,
  trust_score,
  created_at
FROM users 
WHERE email = 'jocelyndru@gmail.com';

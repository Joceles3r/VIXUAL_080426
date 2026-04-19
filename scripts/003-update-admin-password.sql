-- ═══════════════════════════════════════════════════════════════════════════
-- VIXUAL - Mise à jour du mot de passe ADMIN/PATRON
-- Email: jocelyndru@gmail.com
-- Mot de passe: Vixual2026!
-- Hash bcrypt généré pour "Vixual2026!" avec 10 rounds
-- ═══════════════════════════════════════════════════════════════════════════

-- Le hash bcrypt pour "Vixual2026!" est:
-- $2a$10$rKN3TRy8P9kZS6sQ5QxQWuG1zvfPl.5NlzR/4gBwDQZBsJXAyLpyS

UPDATE users 
SET 
  password_hash = '$2a$10$rKN3TRy8P9kZS6sQ5QxQWuG1zvfPl.5NlzR/4gBwDQZBsJXAyLpyS',
  updated_at = NOW()
WHERE email = 'jocelyndru@gmail.com';

-- Vérifier que la mise à jour a été effectuée
SELECT 
  id,
  email,
  display_name,
  role,
  is_verified,
  vixupoints_balance,
  trust_score,
  updated_at
FROM users 
WHERE email = 'jocelyndru@gmail.com';

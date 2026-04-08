-- Add channel column to promo_actions table
ALTER TABLE promo_actions ADD COLUMN IF NOT EXISTS channel VARCHAR(50);

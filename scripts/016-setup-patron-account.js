/**
 * VIXUAL - Configuration directe du compte PATRON
 * 
 * Ce script configure le compte administrateur avec:
 * - Email: jocelyndru@gmail.com
 * - Mot de passe provisoire: Clef*000.vix (hashé avec bcrypt)
 * - Role: patron (accès complet à l'administration)
 */

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

const PATRON_EMAIL = "jocelyndru@gmail.com";
const PATRON_PASSWORD = "Clef*000.vix";
const PATRON_NAME = "PATRON VIXUAL";

async function setupPatronAccount() {
  console.log("=".repeat(50));
  console.log("VIXUAL - Configuration du compte PATRON");
  console.log("=".repeat(50));

  try {
    // Hasher le mot de passe avec bcrypt (12 rounds pour la sécurité)
    const passwordHash = await bcrypt.hash(PATRON_PASSWORD, 12);
    console.log("Mot de passe hashé avec succès");

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await sql`
      SELECT id, email FROM users WHERE email = ${PATRON_EMAIL}
    `;

    if (existingUser.length > 0) {
      // Mettre à jour l'utilisateur existant
      await sql`
        UPDATE users 
        SET 
          password_hash = ${passwordHash},
          roles = ARRAY['visitor', 'patron']::text[],
          name = ${PATRON_NAME},
          updated_at = now()
        WHERE email = ${PATRON_EMAIL}
      `;
      console.log("Compte PATRON mis à jour avec succès");
    } else {
      // Créer un nouvel utilisateur
      await sql`
        INSERT INTO users (email, password_hash, name, roles, created_at, updated_at)
        VALUES (
          ${PATRON_EMAIL},
          ${passwordHash},
          ${PATRON_NAME},
          ARRAY['visitor', 'patron']::text[],
          now(),
          now()
        )
      `;
      console.log("Compte PATRON créé avec succès");
    }

    console.log("");
    console.log("=".repeat(50));
    console.log("CONFIGURATION TERMINEE");
    console.log("=".repeat(50));
    console.log("");
    console.log("Vous pouvez maintenant vous connecter:");
    console.log("  URL: /login");
    console.log("  Email: " + PATRON_EMAIL);
    console.log("  Mot de passe: Clef*000.vix");
    console.log("");
    console.log("Une fois connecté, allez dans:");
    console.log("  Dashboard > Paramètres > Changer mon mot de passe");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("Erreur lors de la configuration:", error);
    throw error;
  }
}

setupPatronAccount();

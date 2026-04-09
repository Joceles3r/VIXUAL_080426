/**
 * VIXUAL - Script de creation de l'utilisateur ADMIN/PATRON
 * 
 * Ce script cree ou reinitialise l'utilisateur admin avec:
 * - Email: jocelyndru@gmail.com
 * - Role: patron (niveau admin le plus eleve)
 * - Mot de passe temporaire: Vixual2026!
 */

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("[VIXUAL] DATABASE_URL non configure");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Configuration admin
const ADMIN_EMAIL = "jocelyndru@gmail.com";
const ADMIN_USERNAME = "VIXUAL_PATRON";
const ADMIN_DISPLAY_NAME = "Jocelyn D. - PATRON VIXUAL";
const TEMP_PASSWORD = "Vixual2026!";
const ADMIN_ROLE = "patron";

async function createAdminUser() {
  console.log("[VIXUAL] Creation/Reinitialisation de l'utilisateur ADMIN...");
  
  try {
    // Hash du mot de passe avec bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10);
    
    // Verifier si l'utilisateur existe deja
    const existingUser = await sql`
      SELECT id, email, role FROM users WHERE email = ${ADMIN_EMAIL.toLowerCase()}
    `;
    
    if (existingUser.length > 0) {
      // Mettre a jour l'utilisateur existant
      console.log("[VIXUAL] Utilisateur existant trouve - Reinitialisation du mot de passe...");
      
      await sql`
        UPDATE users 
        SET 
          password_hash = ${passwordHash},
          role = ${ADMIN_ROLE},
          display_name = ${ADMIN_DISPLAY_NAME},
          is_verified = true,
          email_verified = true,
          updated_at = NOW()
        WHERE email = ${ADMIN_EMAIL.toLowerCase()}
      `;
      
      console.log("[VIXUAL] Mot de passe reinitialise avec succes!");
      console.log(`[VIXUAL] ID utilisateur: ${existingUser[0].id}`);
    } else {
      // Creer un nouvel utilisateur admin
      console.log("[VIXUAL] Creation d'un nouvel utilisateur ADMIN...");
      
      const newUser = await sql`
        INSERT INTO users (
          email,
          username,
          display_name,
          password_hash,
          role,
          is_verified,
          email_verified,
          vixupoints_balance,
          trust_score,
          created_at,
          updated_at
        ) VALUES (
          ${ADMIN_EMAIL.toLowerCase()},
          ${ADMIN_USERNAME},
          ${ADMIN_DISPLAY_NAME},
          ${passwordHash},
          ${ADMIN_ROLE},
          true,
          true,
          10000,
          100,
          NOW(),
          NOW()
        )
        RETURNING id, email, role
      `;
      
      console.log("[VIXUAL] Utilisateur ADMIN cree avec succes!");
      console.log(`[VIXUAL] ID: ${newUser[0].id}`);
      console.log(`[VIXUAL] Email: ${newUser[0].email}`);
      console.log(`[VIXUAL] Role: ${newUser[0].role}`);
    }
    
    console.log("");
    console.log("=".repeat(50));
    console.log("[VIXUAL] CONNEXION ADMIN");
    console.log("=".repeat(50));
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Mot de passe temporaire: ${TEMP_PASSWORD}`);
    console.log("");
    console.log("IMPORTANT: Changez ce mot de passe apres la premiere connexion!");
    console.log("=".repeat(50));
    
  } catch (error) {
    console.error("[VIXUAL] Erreur lors de la creation de l'admin:", error);
    process.exit(1);
  }
}

createAdminUser();

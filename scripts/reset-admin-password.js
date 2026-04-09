/**
 * Script pour réinitialiser le mot de passe admin via l'API
 */

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

async function resetPassword() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jocelyndru@gmail.com',
        newPassword: 'Vixual2026!',
        secretKey: 'VIXUAL_TEMP_RESET_2026'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

resetPassword();

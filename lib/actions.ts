'use server';

import { sql } from '@vercel/postgres';

interface SubscribeResult {
  success: boolean;
  message: string;
  id?: number;
}

export async function subscribeUser(firstName: string, email: string): Promise<SubscribeResult> {
  // Validation côté serveur
  if (!firstName || !email) {
    return { 
      success: false, 
      message: 'Le prénom et l\'email sont requis' 
    };
  }
  
  // Validation simple d'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { 
      success: false, 
      message: 'Format d\'email invalide' 
    };
  }
  
  try {
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.rows.length > 0) {
      return { 
        success: false, 
        message: 'Cet email est déjà inscrit.'
      };
    }
    
    // Ajouter le nouvel abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email)
      VALUES (${firstName}, ${email})
      RETURNING id
    `;
    
    return { 
      success: true, 
      message: 'Inscription réussie ! Vérifiez votre email pour recevoir votre PDF.',
      id: result.rows[0].id
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return { 
      success: false, 
      message: 'Une erreur est survenue lors de l\'inscription.' 
    };
  }
}
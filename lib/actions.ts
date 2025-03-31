// Dans lib/actions.ts
'use server';

import { neon } from '@neondatabase/serverless';

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
    // Essayer différentes variables d'environnement pour la connexion
    const connectionString = process.env.DATABASE_URL || 
                            process.env.POSTGRES_URL || 
                            process.env.POSTGRES_PRISMA_URL;
    
    if (!connectionString) {
      console.error('Aucune chaîne de connexion à la base de données n\'a été trouvée');
      return {
        success: false,
        message: 'Erreur de configuration de la base de données'
      };
    }
    
    // Connexion à la base de données
    const sql = neon(connectionString);
    
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
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
      id: result[0].id
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return { 
      success: false, 
      message: 'Une erreur est survenue lors de l\'inscription.' 
    };
  }
}
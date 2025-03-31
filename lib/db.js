import { neon } from '@neondatabase/serverless';

// Fonction pour obtenir une connexion à la base de données
import { neon } from '@neondatabase/serverless';

// Fonction pour obtenir une connexion à la base de données
export function getDb() {
  const connectionString = process.env.DATABASE_URL || 
                          process.env.POSTGRES_URL || 
                          process.env.POSTGRES_PRISMA_URL;
  
  if (!connectionString) {
    console.error("ERREUR: Aucune chaîne de connexion à la base de données n'a été trouvée");
    throw new Error("Configuration de base de données manquante");
  }
  
  return neon(connectionString);
}
// Fonction pour ajouter un nouvel abonné
export async function addSubscriber(firstName, email) {
  const sql = getDb();
  
  try {
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      return { success: false, message: 'Cet email est déjà inscrit.' };
    }
    
    // Ajouter le nouvel abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email)
      VALUES (${firstName}, ${email})
      RETURNING id
    `;
    
    return { 
      success: true, 
      message: 'Inscription réussie !',
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

// Fonction pour récupérer tous les abonnés
export async function getAllSubscribers() {
  const sql = getDb();
  
  try {
    const subscribers = await sql`
      SELECT * FROM subscribers ORDER BY created_at DESC
    `;
    
    return subscribers;
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    return [];
  }
}

// Fonction pour marquer le PDF comme envoyé
export async function markPdfSent(id) {
  const sql = getDb();
  
  try {
    await sql`
      UPDATE subscribers SET pdf_sent = true WHERE id = ${id}
    `;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut d\'envoi:', error);
    return { success: false };
  }
}
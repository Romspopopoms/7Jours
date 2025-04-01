// pages/api/migrate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';

type ResponseData = {
  success: boolean;
  message: string;
  error?: string;
};

export default async function handler(
  _req: NextApiRequest,  // Préfixe avec _ pour indiquer que c'est non utilisé
  res: NextApiResponse<ResponseData>
) {
  try {
    const sql = getDb();
    
    // Créer la table subscribers
    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        pdf_sent BOOLEAN DEFAULT FALSE,
        source TEXT DEFAULT 'landing_page'
      )
    `;
    
    // Créer l'index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email)
    `;
    
    return res.status(200).json({ success: true, message: 'Tables créées avec succès' });
  } catch (error: unknown) {
    console.error('Erreur lors de la migration:', error);
    
    // Gérer l'erreur en vérifiant son type
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la migration',
      error: errorMessage
    });
  }
}
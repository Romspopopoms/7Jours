// Migration script pour créer/mettre à jour la table subscribers
import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const sql = getDb();

    // Vérifier et créer la table avec les colonnes correctes
    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        consent_given BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Si la table existe déjà, ajouter la colonne manquante de manière sécurisée
    await sql`
      DO $$
      BEGIN
        -- Tenter d'ajouter la colonne consent_given si elle n'existe pas
        BEGIN
          ALTER TABLE subscribers ADD COLUMN consent_given BOOLEAN DEFAULT FALSE;
        EXCEPTION WHEN duplicate_column THEN
          -- La colonne existe déjà, ne rien faire
          RAISE NOTICE 'Column consent_given already exists';
        END;
      END $$
    `;

    // Créer un index pour améliorer les performances
    await sql`
      CREATE INDEX IF NOT EXISTS idx_subscribers_email 
      ON subscribers(email)
    `;

    console.log('Migration de la base de données réussie');

    return res.status(200).json({ 
      success: true, 
      message: 'Base de données mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur de migration de la base de données:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Échec de la migration de la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
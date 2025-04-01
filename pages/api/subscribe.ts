// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

type ResponseData = {
  success: boolean;
  message: string;
  id?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { firstName, email } = req.body;
    
    // Validation
    if (!firstName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le prénom et l\'email sont requis' 
      });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format d\'email invalide' 
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà inscrit.'
      });
    }
    
    // Ajouter l'abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email)
      VALUES (${firstName}, ${email})
      RETURNING id
    `;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Inscription réussie ! Vérifiez votre email pour recevoir votre PDF.',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'inscription.' 
    });
  }
}
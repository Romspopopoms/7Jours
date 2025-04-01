import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';

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
    const { firstName, email, consentGiven } = req.body;
    
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

    // Si l'utilisateur n'a pas donné son consentement
    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        message: 'Nous avons besoin de votre consentement pour continuer'
      });
    }
    
    // Connexion à la base de données
    const sql = getDb();
    
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà inscrit, merci de votre intérêt !'
      });
    }
    
    // Ajouter le nouvel abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email, consent_given)
      VALUES (${firstName}, ${email}, ${consentGiven})
      RETURNING id
    `;
    
    // Ici, on pourrait ajouter l'envoi d'un email de confirmation
    // En utilisant un service comme SendGrid, Mailchimp, etc.
    // sendConfirmationEmail(firstName, email);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Inscription réussie ! Votre PDF est en cours de téléchargement.',
      id: result[0].id
    });
  } catch (error: unknown) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'inscription.' 
    });
  }
}
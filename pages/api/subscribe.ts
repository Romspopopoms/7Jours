import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';

// Interface pour le corps de la requête
interface SubscriptionRequestBody {
  firstName: string;
  email: string;
  consentGiven: boolean;
}

// Interface pour la réponse
interface ResponseData {
  success: boolean;
  message: string;
  errors?: string[];
  id?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Vérifier la méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée' 
    });
  }

  try {
    // Validation du corps de la requête
    const { firstName, email, consentGiven } = req.body as SubscriptionRequestBody;
    const errors: string[] = [];

    // Validation du prénom
    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      errors.push('Le prénom est requis et doit être une chaîne non vide');
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.push('Une adresse email valide est requise');
    }

    // Validation du consentement
    const isConsentGiven = consentGiven === true;
    if (!isConsentGiven) {
      errors.push('Un consentement explicite est nécessaire');
    }

    // Retourner les erreurs si présentes
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Échec de la validation',
        errors
      });
    }

    // Connexion à la base de données
    const sql = getDb();
    
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email.trim()}
    `;
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà inscrit',
        errors: ['Un abonnement existe déjà avec cette adresse email']
      });
    }
    
    // Insérer le nouvel abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email, consent_given)
      VALUES (${firstName.trim()}, ${email.trim()}, ${isConsentGiven})
      RETURNING id
    `;
    
    // Réponse de succès
    return res.status(200).json({ 
      success: true, 
      message: 'Inscription réussie ! Votre PDF est en cours de téléchargement.',
      id: result[0].id
    });
  } catch (error: unknown) {
    // Gestion des erreurs détaillée
    console.error('Erreur lors de l\'inscription:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue lors de l\'inscription';
    
    return res.status(500).json({ 
      success: false, 
      message: 'Échec de l\'inscription',
      errors: [errorMessage]
    });
  }
}
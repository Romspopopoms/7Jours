// Point d'entrée de l'API d'inscription avec typage strict

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';

// Définition du type pour le corps de la requête
interface SubscriptionRequestBody {
  firstName: string;
  email: string;
  consentGiven: boolean;
}

// Fonction de validation avec typage strict
const validateSubscriptionRequest = (body: SubscriptionRequestBody) => {
  const errors: string[] = [];

  // Validation du prénom
  if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim() === '') {
    errors.push('Le prénom est requis et doit être une chaîne de caractères non vide');
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || typeof body.email !== 'string' || !emailRegex.test(body.email)) {
    errors.push('Une adresse email valide est requise');
  }

  // Validation du consentement
  if (body.consentGiven !== true) {
    errors.push('Un consentement explicite est requis');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérification de la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée' 
    });
  }

  // Vérification du type de contenu
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le type de contenu doit être application/json',
      details: {
        typeReçu: contentType
      }
    });
  }

  try {
    // Typage et validation du corps de la requête
    const body = req.body as SubscriptionRequestBody;

    // Validation complète
    const validationResult = validateSubscriptionRequest(body);
    
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Échec de la validation',
        erreurs: validationResult.errors
      });
    }

    const { firstName, email, consentGiven } = body;
    
    // Connexion à la base de données
    const sql = getDb();
    
    // Vérification des utilisateurs existants
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà enregistré'
      });
    }
    
    // Insertion du nouvel abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email, consent_given)
      VALUES (${firstName}, ${email}, ${consentGiven})
      RETURNING id
    `;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Inscription réussie !',
      id: result[0].id
    });
  } catch (error: unknown) {
    // Journalisation détaillée des erreurs
    console.error('Erreur d\'inscription :', error);
    
    const messageErreur = error instanceof Error 
      ? error.message 
      : 'Une erreur inconnue est survenue';
    
    return res.status(500).json({ 
      success: false, 
      message: 'L\'inscription a échoué',
      detailsErreur: messageErreur
    });
  }
}
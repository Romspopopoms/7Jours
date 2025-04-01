// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { addSubscriber } from '../../lib/db'; // Assurez-vous que le chemin est correct

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
    
    // Utilisez la fonction addSubscriber de db.js
    const result = await addSubscriber(firstName, email);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'inscription.' 
    });
  }
}
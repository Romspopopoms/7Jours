import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyEmailConfig, sendConfirmationEmail } from '../../lib/email';

type ResponseData = {
  success: boolean;
  message: string;
  config?: {
    host?: string;
    user?: string;
    configured: boolean;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Cette route n'est accessible qu'en GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier la configuration
    const isConfigValid = await verifyEmailConfig();
    
    // Récupérer les paramètres
    const { test, email, name } = req.query;
    
    // Si le paramètre 'test' est défini et qu'un email est fourni, envoyer un email de test
    if (test === 'send' && typeof email === 'string' && typeof name === 'string') {
      if (!isConfigValid) {
        return res.status(500).json({
          success: false,
          message: 'La configuration email n\'est pas valide. Impossible d\'envoyer l\'email de test.',
          config: {
            host: process.env.EMAIL_HOST || undefined,
            user: process.env.EMAIL_USER ? '✓' : undefined,
            configured: isConfigValid
          }
        });
      }
      
      // Envoyer un email de test
      const emailSent = await sendConfirmationEmail(name, email);
      
      if (emailSent) {
        return res.status(200).json({
          success: true,
          message: `Email de test envoyé avec succès à ${email}`,
          config: {
            host: process.env.EMAIL_HOST || undefined,
            user: process.env.EMAIL_USER ? '✓' : undefined,
            configured: isConfigValid
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Échec de l\'envoi de l\'email de test',
          config: {
            host: process.env.EMAIL_HOST || undefined,
            user: process.env.EMAIL_USER ? '✓' : undefined,
            configured: isConfigValid
          }
        });
      }
    }
    
    // Retourner l'état de la configuration
    return res.status(200).json({
      success: isConfigValid,
      message: isConfigValid 
        ? 'Configuration email valide' 
        : 'Configuration email invalide',
      config: {
        host: process.env.EMAIL_HOST || undefined,
        user: process.env.EMAIL_USER ? '✓' : undefined,
        configured: isConfigValid
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return res.status(500).json({
      success: false,
      message: `Erreur lors de la vérification de la configuration email: ${errorMessage}`
    });
  }
}
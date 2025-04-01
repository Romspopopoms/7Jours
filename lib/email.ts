import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';

// Configuration sécurisée du transporteur d'email
const createEmailTransporter = () => {
  // Vérification des variables d'environnement
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${missingVars.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Charge un fichier PDF de manière sécurisée
 * @param filename Nom du fichier PDF
 * @returns Buffer du fichier PDF
 */
async function loadPDFFile(filename: string): Promise<Buffer> {
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Erreur lors du chargement du fichier PDF ${filename}:`, error);
    throw new Error(`Impossible de charger le fichier PDF ${filename}`);
  }
}

// Interface pour les détails d'erreur
interface EmailErrorDetails {
  message: string;
  name: string;
  stack?: string;
}

/**
 * Envoie un email de confirmation après l'inscription
 * @param firstName Prénom du destinataire
 * @param email Adresse email du destinataire
 * @returns Promesse qui indique si l'email a été envoyé avec succès
 */
export async function sendConfirmationEmail(firstName: string, email: string): Promise<{
  sent: boolean;
  error?: string;
  errorDetails?: EmailErrorDetails;
}> {
  try {
    // Créer le transporteur d'email
    const transporter = createEmailTransporter();

    // Charger le PDF
    const pdfBuffer = await loadPDFFile('7-jours-de-priere.pdf');

    // Contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #152f5e; padding: 20px; text-align: center; color: white;">
          <h1>Chrétien Réfléchi</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Merci pour votre inscription, ${firstName} !</h2>
          <p>Nous sommes ravis que vous ayez rejoint notre parcours "7 Jours de Prière".</p>
          <p>Vous trouverez ci-joint votre PDF pour commencer ce voyage spirituel.</p>
          <p>Pendant les 7 prochains jours, vous recevrez quotidiennement:</p>
          <ul>
            <li>Une parole biblique inspirante</li>
            <li>Un chant chrétien pour prier en musique</li>
            <li>Une méditation profonde</li>
            <li>Une action concrète pour vivre votre foi</li>
          </ul>
          <p>Que Dieu vous bénisse dans cette démarche.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>Chrétien Réfléchi - Pour approfondir votre foi au quotidien</p>
          <p>Si vous souhaitez vous désinscrire, <a href="mailto:contact@chretienreflechi.fr">contactez-nous</a>.</p>
        </div>
      </div>
    `;

    try {
      // Envoi de l'email
      const result = await transporter.sendMail({
        from: `"Chrétien Réfléchi" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Bienvenue au parcours 7 Jours de Prière !',
        html: htmlContent,
        text: `Merci pour votre inscription, ${firstName} ! Nous sommes ravis que vous ayez rejoint notre parcours "7 Jours de Prière".`,
        attachments: [
          {
            filename: '7-jours-de-priere.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(`Email de confirmation envoyé à ${email}. ID du message:`, result.messageId);
      return { sent: true };
    } catch (sendError) {
      // Log détaillé de l'erreur d'envoi
      const errorDetails: EmailErrorDetails = {
        message: sendError instanceof Error ? sendError.message : 'Erreur inconnue',
        name: sendError instanceof Error ? sendError.name : 'UnknownError',
        stack: sendError instanceof Error ? sendError.stack : undefined
      };

      console.error(`Erreur lors de l'envoi de l'email à ${email}:`, {
        errorName: errorDetails.name,
        errorMessage: errorDetails.message,
        errorStack: errorDetails.stack,
        emailDetails: {
          to: email,
          from: process.env.EMAIL_USER,
          subject: 'Bienvenue au parcours 7 Jours de Prière !'
        }
      });

      return {
        sent: false,
        error: 'Échec de l\'envoi de l\'email',
        errorDetails
      };
    }
  } catch (error) {
    // Log des erreurs de préparation (chargement PDF, etc.)
    const errorDetails: EmailErrorDetails = {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: error instanceof Error ? error.stack : undefined
    };

    console.error('Erreur lors de la préparation de l\'email:', {
      errorName: errorDetails.name,
      errorMessage: errorDetails.message,
      errorStack: errorDetails.stack
    });

    return {
      sent: false,
      error: 'Erreur de préparation de l\'email',
      errorDetails
    };
  }
}

/**
 * Vérifie la configuration du transporteur email
 * @returns Promesse indiquant si la configuration est valide
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Erreur de configuration du transporteur email:', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

/**
 * API de gestion de la configuration email
 */
export async function checkEmailConfiguration() {
  try {
    const isConfigValid = await verifyEmailConfig();
    return {
      configured: isConfigValid,
      host: process.env.EMAIL_HOST,
      user: process.env.EMAIL_USER ? '✓' : undefined
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de la configuration email:', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    return {
      configured: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
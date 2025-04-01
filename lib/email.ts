import nodemailer from 'nodemailer';

// Configuration du transporteur d'email
// Pour la production, utilisez vos propres identifiants SMTP
// Pour le développement, vous pouvez utiliser les services de test comme Ethereal
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Interface pour le contenu de l'email
interface EmailContent {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Envoie un email de confirmation après l'inscription
 * @param firstName Prénom du destinataire
 * @param email Adresse email du destinataire
 * @returns Promesse qui se résout lorsque l'email est envoyé
 */
export async function sendConfirmationEmail(firstName: string, email: string): Promise<boolean> {
  try {
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

    // Configuration de l'email
    const mailOptions: EmailContent = {
      to: email,
      subject: 'Bienvenue au parcours 7 Jours de Prière !',
      html: htmlContent,
      text: `Merci pour votre inscription, ${firstName} ! Nous sommes ravis que vous ayez rejoint notre parcours "7 Jours de Prière". Vous trouverez ci-joint votre PDF pour commencer ce voyage spirituel.`,
    };

    // Envoi de l'email
    await transporter.sendMail({
      from: `"Chrétien Réfléchi" <${process.env.EMAIL_USER}>`,
      ...mailOptions,
      attachments: [
        {
          filename: '7-jours-de-priere.pdf',
          path: './public/7-jours-de-priere.pdf', // Chemin vers le PDF dans le dossier public
        },
      ],
    });

    console.log(`Email de confirmation envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return false;
  }
}

// Vérifier la configuration du transporteur email
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Erreur de configuration du transporteur email:', error);
    return false;
  }
}
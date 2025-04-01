'use client';

import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import React from "react";

interface FormStatusType {
  type: 'success' | 'error' | '';
  message: string;
}

export default function LandingPage7Jours() {
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<FormStatusType>({ type: '', message: '' });
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // S'assurer que la table existe au chargement de la page
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const response = await fetch('/api/migrate');
        const data = await response.json();
        
        if (data.success) {
          console.log('Base de données prête');
          setDbReady(true);
        } else {
          console.error('Erreur d\'initialisation de la base de données:', data.message);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
      }
    };

    initDatabase();
  }, []);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (!dbReady) {
      setFormStatus({
        type: 'error',
        message: 'Le système n\'est pas encore prêt, veuillez réessayer dans quelques instants.'
      });
      return;
    }
    
    // Validation simple
    if (!firstName.trim() || !email.trim()) {
      setFormStatus({ 
        type: 'error', 
        message: 'Merci de remplir tous les champs.'
      });
      return;
    }

    // Afficher la modale de consentement
    setShowConsentModal(true);
  };

  const downloadPDF = () => {
    // Créer un lien pour télécharger le PDF
    const link = document.createElement('a');
    link.href = '/7-jours-de-priere.pdf'; // Chemin vers votre PDF dans le dossier public
    link.setAttribute('download', '7-jours-de-priere.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConsentAndSubmit = async (consent: boolean): Promise<void> => {
    setShowConsentModal(false);
    
    if (!consent) {
      setFormStatus({
        type: 'error',
        message: 'Nous avons besoin de votre consentement pour vous envoyer le PDF.'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          firstName, 
          email,
          consentGiven: consent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setFormStatus({ 
          type: 'success', 
          message: result.message
        });
        
        // Si l'email n'a pas été envoyé, télécharger le PDF directement
        if (!result.emailSent) {
          downloadPDF();
        }
        
        // Réinitialiser le formulaire
        setFirstName('');
        setEmail('');
      } else {
        setFormStatus({ 
          type: 'error', 
          message: result.message || 'Une erreur est survenue. Veuillez réessayer.'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setFormStatus({ 
        type: 'error', 
        message: 'Une erreur est survenue. Veuillez réessayer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-blue-950 text-white flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Image de fond floutée */}
      <div className="absolute inset-0">
        <Image
          src="/LogoChretienReflechi.jpg"
          alt="Fond de prière"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-40 blur-xl"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-3xl w-full text-center space-y-10">
        {/* Titre */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            7 Jours de Prière<br />avec Chrétien Réfléchi
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            Un parcours spirituel profond : chaque jour, un chant, une parole, une méditation.
          </p>
        </div>

        {/* Formulaire */}
        <form 
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="bg-white/20 backdrop-blur-md text-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto space-y-4 border border-white/30"
        >
          {formStatus.message && (
            <div 
              className={`p-3 rounded-lg text-sm ${
                formStatus.type === 'success' 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-red-500/20 text-red-100'
              }`}
            >
              {formStatus.message}
            </div>
          )}
          
          <input
            type="text"
            placeholder="Ton prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
            required
          />
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting 
                ? 'bg-blue-800/60 cursor-not-allowed' 
                : 'bg-blue-600/60 hover:bg-blue-500/60 active:bg-blue-700/70'
            } text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/20`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : 'Je reçois mon PDF gratuit'}
          </button>
        </form>

        {/* Ce que tu recevras */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left space-y-3">
          <h3 className="text-center text-xl font-semibold mb-2">Ce que tu recevras :</h3>
          <div className="text-gray-200 space-y-3">
            <p className="flex items-start">
              <span className="mr-3 text-xl">📖</span> 
              <span>Une parole biblique qui éclaire ta journée</span>
            </p>
            <p className="flex items-start">
              <span className="mr-3 text-xl">🎵</span> 
              <span>Un chant chrétien pour prier en musique</span>
            </p>
            <p className="flex items-start">
              <span className="mr-3 text-xl">🧘‍♂️</span> 
              <span>Une méditation simple et profonde</span>
            </p>
            <p className="flex items-start">
              <span className="mr-3 text-xl">🙏</span> 
              <span>Une action concrète pour vivre ta foi</span>
            </p>
          </div>
        </div>

        {/* CTA final */}
        <div>
          <h3 className="text-xl md:text-2xl font-medium mb-2">Laisse Dieu toucher ton cœur</h3>
          <p className="text-gray-300 mb-4">Inscris-toi dès maintenant et commence ce voyage intérieur</p>
          <button 
            onClick={() => {
              if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-600/60 hover:bg-blue-500/60 active:bg-blue-700/70 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
          >
            Je commence les 7 jours
          </button>
        </div>
      </div>

      {/* Modal de consentement */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-blue-700">
            <h2 className="text-xl font-bold mb-4">Confirmation d&apos;inscription</h2>
            
            <p className="mb-6 text-gray-200">
              En cliquant sur J&apos;accepte, vous consentez à recevoir le PDF 7 Jours de Prière ainsi que des emails occasionnels de Chrétien Réfléchi avec du contenu spirituel et des offres.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => handleConsentAndSubmit(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
              >
                Non merci
              </button>
              <button
                onClick={() => handleConsentAndSubmit(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
              >
                J&apos;accepte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
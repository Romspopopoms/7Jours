'use client';

import { useState, FormEvent, useEffect } from "react";
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

  // Dans votre composant LandingPage7Jours
const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  
  if (!dbReady) {
    setFormStatus({
      type: 'error',
      message: 'Le système n\'est pas encore prêt, veuillez réessayer dans quelques instants.'
    });
    return;
  }
  // Réinitialiser le statut du formulaire
  setFormStatus({ type: '', message: '' });
  
  // Validation simple
  if (!firstName.trim() || !email.trim()) {
    setFormStatus({ 
      type: 'error', 
      message: 'Merci de remplir tous les champs.'
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
      body: JSON.stringify({ firstName, email })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setFormStatus({ 
        type: 'success', 
        message: result.message || 'Inscription réussie ! Vérifiez votre email pour recevoir votre PDF.'
      });
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
          layout="fill"
          objectFit="cover"
          className="opacity-40 blur-xl"
          priority
        />
        <div className="absolute inset-0 bg-opacity-70"></div>
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
          onSubmit={handleSubmit}
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
            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/40 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/40 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting 
                ? 'bg-blue-800/60 cursor-not-allowed' 
                : 'bg-blue-600/60 hover:bg-blue-600/30'
            } text-white py-2 rounded-xl font-semibold transition`}
          >
            {isSubmitting ? 'Inscription en cours...' : 'Je m\'inscris gratuitement'}
          </button>
        </form>

        {/* Ce que tu recevras */}
        <div className="text-gray-200 space-y-2">
          <p>📖 Une parole biblique qui éclaire ta journée</p>
          <p>🎵 Un chant chrétien pour prier en musique</p>
          <p>🧘‍♂️ Une méditation simple et profonde</p>
          <p>🙏 Une action concrète pour vivre ta foi</p>
        </div>

        {/* CTA final */}
        <div>
          <h3 className="text-xl md:text-2xl font-medium mb-2">Laisse Dieu toucher ton cœur</h3>
          <p className="text-gray-300 mb-4">Inscris-toi dès maintenant et commence ce voyage intérieur</p>
          <button 
            onClick={() => {
              const formElement = document.querySelector('form');
              if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-600/60 hover:bg-blue-600/30 text-white px-6 py-3 rounded-2xl font-semibold transition"
          >
            Je commence les 7 jours
          </button>
        </div>
        </div>
      </div>
  );
}
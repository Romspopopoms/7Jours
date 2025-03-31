import Image from "next/image";

export default function LandingPage7Jours() {
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
        <form className="bg-white/20 backdrop-blur-md text-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto space-y-4 border border-white/30">
          <input
            type="text"
            placeholder="Ton prénom"
            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/40 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Ton email"
            className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-600/60 hover:bg-blue-600/30 text-white py-2 rounded-xl font-semibold transition"
          >
            Je m'inscris gratuitement
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
          <button className="bg-blue-600/60 hover:bg-blue-600/30 text-white px-6 py-3 rounded-2xl font-semibold transition">
            Je commence les 7 jours
          </button>
        </div>
      </div>
    </div>
  );
}

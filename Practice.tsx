import React from 'react';
import { Compass, Mic, PenTool, Layers, Repeat, Type, Hash, Clock, BrainCircuit, Sparkles, Radio } from 'lucide-react';

interface PracticeProps {
  onStart: (id: string, title: string) => void;
  onStartLive: () => void;
}

const Practice: React.FC<PracticeProps> = ({ onStart, onStartLive }) => {
  const practiceOptions = [
    {
      id: 'practice_ai_personalized',
      title: 'Ma Leçon Personnalisée (IA)',
      description: 'Analyse vos erreurs et génère un cours sur-mesure.',
      icon: <BrainCircuit size={32} className="text-white" />,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      shadow: 'shadow-[0_4px_0_0_#4c1d95]',
      special: true
    },
    {
      id: 'practice_live_conversation',
      title: 'Conversation Live (IA)',
      description: 'Discutez en direct avec Duo. Parlez de tout !',
      icon: <Radio size={32} className="text-white" />,
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      shadow: 'shadow-[0_4px_0_0_#9f1239]',
      isLive: true
    },
    {
      id: 'practice_verbs_general',
      title: 'Verbes (Général)',
      description: 'Révision globale des verbes.',
      icon: <Compass size={32} className="text-white" />,
      color: 'bg-blue-500',
      shadow: 'shadow-[0_4px_0_0_#2563eb]'
    },
    {
      id: 'practice_pronunciation',
      title: 'Prononciation',
      description: '20 mots + 5 difficiles (Micro activé).',
      icon: <Mic size={32} className="text-white" />,
      color: 'bg-purple-500',
      shadow: 'shadow-[0_4px_0_0_#9333ea]'
    },
    {
      id: 'practice_conjugation_present',
      title: 'Conjugaison (Présent)',
      description: '20 exercices sur le présent.',
      icon: <Repeat size={32} className="text-white" />,
      color: 'bg-green-500',
      shadow: 'shadow-[0_4px_0_0_#16a34a]'
    },
    {
      id: 'practice_conjugation_imperfect',
      title: 'Conjugaison (Imparfait)',
      description: '20 exercices sur l\'imparfait.',
      icon: <Clock size={32} className="text-white" />,
      color: 'bg-orange-500',
      shadow: 'shadow-[0_4px_0_0_#ea580c]'
    },
    {
      id: 'practice_gender_number',
      title: 'Genre & Nombre',
      description: '15 exercices (Masc/Fém, Sing/Plur).',
      icon: <Hash size={32} className="text-white" />,
      color: 'bg-pink-500',
      shadow: 'shadow-[0_4px_0_0_#db2777]'
    },
    {
      id: 'practice_determinants',
      title: 'Déterminants',
      description: 'Le, la, les, un, une, des...',
      icon: <Layers size={32} className="text-white" />,
      color: 'bg-teal-500',
      shadow: 'shadow-[0_4px_0_0_#0d9488]'
    },
    {
      id: 'practice_homophones',
      title: 'Homophones',
      description: '25 exercices (a/à, et/est, etc.).',
      icon: <Type size={32} className="text-white" />,
      color: 'bg-indigo-500',
      shadow: 'shadow-[0_4px_0_0_#4f46e5]'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-10 px-4 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-700 mb-4">Entraînement Personnalisé IA</h1>
        <p className="text-xl text-gray-500">
          Choisissez un module ciblé généré en temps réel par Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practiceOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => option.isLive ? onStartLive() : onStart(option.id, option.title)}
            className={`flex items-center p-6 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95 group w-full text-left relative overflow-hidden`}
          >
            {option.special && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1 shadow-sm">
                    <Sparkles size={10} /> GEMINI PRO
                </div>
            )}
            {option.isLive && (
                <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1 animate-pulse shadow-sm">
                    <Radio size={10} /> LIVE
                </div>
            )}
            <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mr-6 ${option.shadow} group-active:shadow-none group-active:translate-y-1 transition-all`}>
              {option.icon}
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-700 mb-1">{option.title}</h3>
              <p className="text-gray-500 font-medium text-sm">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Practice;
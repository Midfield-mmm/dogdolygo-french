import React, { useEffect, useState } from 'react';
import { Gem } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface CompletionModalProps {
  gems: number;
  onClose: () => void;
}

const MESSAGES = [
  "You work for the CIA!",
  "Wow! You're awesome!",
  "You rock 😃",
  "Incroyable !",
  "Tu es un génie !",
  "Magnifique travail !",
  "Quelle performance !"
];

const CompletionModal: React.FC<CompletionModalProps> = ({ gems, onClose }) => {
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  useEffect(() => {
    // Play the celebration sound when the modal mounts
    soundManager.playComplete();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center transform transition-all animate-in zoom-in-95 duration-300 border-b-8 border-gray-200 shadow-2xl relative overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-yellow-400/10 pointer-events-none"></div>

        <div className="mb-2 flex justify-center">
             <div className="relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                 <img 
                    src="https://i.postimg.cc/RZf6wjn9/Gemini-Generated-Image-kuhys1kuhys1kuhy.png" 
                    alt="Victory" 
                    className="w-48 h-auto object-contain relative z-10 animate-in zoom-in duration-500 drop-shadow-xl" 
                 />
             </div>
        </div>

        <h2 className="text-3xl font-extrabold text-yellow-500 mb-2">Leçon terminée !</h2>
        <p className="text-xl text-gray-600 font-bold mb-8">{message}</p>

        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <div className="text-gray-500 font-bold uppercase text-xs mb-1">Récompense totale</div>
            <div className="flex items-center space-x-3">
                 <Gem size={40} className="text-duo-blue fill-duo-blue animate-bounce" />
                 <span className="text-4xl font-extrabold text-duo-blue">+{gems}</span>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full bg-duo-green text-white py-4 rounded-xl font-bold text-lg uppercase shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all hover:bg-duo-green-dark"
        >
            Continuer
        </button>
      </div>
    </div>
  );
};

export default CompletionModal;
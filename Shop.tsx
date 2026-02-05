import React from 'react';
import { Heart, Zap, Snowflake, Gem } from 'lucide-react';
import { UserStats } from '../types';
import { soundManager } from '../utils/sound';

interface ShopProps {
  stats: UserStats;
  onBuy: (item: string, cost: number) => void;
}

const Shop: React.FC<ShopProps> = ({ stats, onBuy }) => {
  
  const handlePurchase = (item: string, cost: number) => {
    if (stats.gems >= cost) {
      onBuy(item, cost);
      soundManager.playCorrect(); // Success sound
    } else {
      soundManager.playWrong(); // Error sound
      alert("Pas assez de Gama !");
    }
  };

  const isUnlimitedActive = stats.inventory.unlimitedHeartsUntil && stats.inventory.unlimitedHeartsUntil > Date.now();

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4 pb-32">
      <h1 className="text-3xl font-extrabold text-gray-700 mb-8">Boutique (Shop)</h1>
      
      <div className="bg-gradient-to-r from-duo-blue to-blue-400 p-6 rounded-2xl text-white mb-8 flex justify-between items-center shadow-lg">
        <div>
           <h2 className="text-xl font-bold">Vos Gama</h2>
           <p className="opacity-90">Utilisez vos Gama pour acheter des bonus.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-xl">
           <Gem size={24} className="fill-white" />
           <span className="text-2xl font-extrabold">{stats.gems}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-700">Cœurs & Vies</h2>
        
        {/* Refill Hearts */}
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
                <Heart className="text-red-500 fill-red-500" size={40} />
                <div>
                    <h3 className="font-bold text-lg">Recharger les vies</h3>
                    <p className="text-gray-500 text-sm">Remet vos vies au maximum (5).</p>
                </div>
            </div>
            <button 
                onClick={() => handlePurchase('refill_hearts', 15)}
                disabled={stats.hearts >= 5}
                className="bg-duo-green text-white px-6 py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all disabled:bg-gray-300 disabled:shadow-none"
            >
                <div className="flex items-center space-x-2">
                    <Gem size={16} /> <span>15</span>
                </div>
            </button>
        </div>

        {/* Unlimited Hearts */}
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
                <div className="relative">
                   <Heart className="text-purple-500 fill-purple-500" size={40} />
                   <div className="absolute -top-1 -right-1">
                       <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                   </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Vies illimitées (15 min)</h3>
                    <p className="text-gray-500 text-sm">Ne perdez plus de vies pendant 15 minutes.</p>
                </div>
            </div>
             <button 
                onClick={() => handlePurchase('unlimited_hearts', 35)}
                disabled={!!isUnlimitedActive}
                className="bg-duo-green text-white px-6 py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all disabled:bg-gray-300 disabled:shadow-none"
            >
                {isUnlimitedActive ? (
                    <span>Actif</span>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Gem size={16} /> <span>35</span>
                    </div>
                )}
            </button>
        </div>

        {/* Streak Freeze */}
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
                <Snowflake className="text-duo-blue fill-duo-blue" size={40} />
                <div>
                    <h3 className="font-bold text-lg">Géleur de série</h3>
                    <p className="text-gray-500 text-sm">Protège votre série si vous manquez un jour.</p>
                </div>
            </div>
             <button 
                onClick={() => handlePurchase('streak_freeze', 75)}
                disabled={stats.inventory.streakFreeze}
                className="bg-duo-green text-white px-6 py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all disabled:bg-gray-300 disabled:shadow-none"
            >
                 {stats.inventory.streakFreeze ? (
                    <span>Équipé</span>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Gem size={16} /> <span>75</span>
                    </div>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Shop;
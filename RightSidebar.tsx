import React from 'react';
import { Flame, Gem, Heart, Shield } from 'lucide-react';
import { UserStats, AvatarConfig } from '../types';

interface RightSidebarProps {
  stats: UserStats;
  onOpenSettings: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ stats, onOpenSettings }) => {
  
  // Helper to render mini avatar (replicated simple version)
  const MiniAvatar = ({ config }: { config?: AvatarConfig }) => {
      if (!config) return <img src="https://postimg.cc/4HzzhkQ8" alt="Settings" className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover" />;
      return (
        <div className="w-9 h-9 rounded-full border-2 border-gray-200 overflow-hidden relative" style={{ backgroundColor: config.backgroundColor }}>
             <svg viewBox="0 0 200 200" className="w-full h-full">
                 {/* Simplified Render for icon size */}
                 <path d="M50,160 Q100,160 150,160 Q180,180 180,220 L20,220 Q20,180 50,160" fill={config.shirtColor} />
                 <circle cx="100" cy="100" r="45" fill={config.skinColor} />
                 {config.hairStyle === 'short' && <path d="M60,100 C60,60 140,60 140,100 L140,90 C140,50 60,50 60,90 Z" fill={config.hairColor} />}
                 {config.hairStyle === 'long' && <path d="M60,100 C60,40 140,40 140,100 L145,160 Q100,160 55,160 Z" fill={config.hairColor} />}
                 {config.hairStyle === 'spiky' && <path d="M55,95 L65,70 L75,90 L85,60 L100,85 L115,60 L125,90 L135,70 L145,95 L140,110 L60,110 Z" fill={config.hairColor} />}
                 {config.hairStyle === 'bob' && <path d="M60,110 C50,110 50,60 100,60 C150,60 150,110 140,110 L140,130 Q100,140 60,130 Z" fill={config.hairColor} />}
                 {config.glasses && <g stroke="#333" strokeWidth="3" fill="rgba(255,255,255,0.3)"><circle cx="85" cy="95" r="14" /><circle cx="115" cy="95" r="14" /><line x1="99" y1="95" x2="101" y2="95" /></g>}
                 {!config.glasses && <><circle cx="85" cy="95" r="5" fill="#333" /><circle cx="115" cy="95" r="5" fill="#333" /></>}
             </svg>
        </div>
      );
  };

  return (
    <div className="hidden xl:block w-80 h-screen fixed right-0 top-0 pt-6 px-6 z-40 overflow-y-auto">
      {/* Top Stats Bar */}
      <div className="flex justify-between items-center mb-10 gap-2">
        <div className="flex-1 flex justify-start space-x-2">
           <div className="group cursor-pointer flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-xl">
            <div className="w-8 h-6 bg-blue-600 rounded-sm shadow-sm overflow-hidden relative flex">
                <div className="w-1/3 h-full bg-blue-600"></div>
                <div className="w-1/3 h-full bg-white"></div>
                <div className="w-1/3 h-full bg-red-600"></div>
            </div>
            <span className="font-bold text-gray-400 uppercase text-sm group-hover:text-gray-600">FR</span>
            </div>
        </div>

        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
            <Flame className="text-orange-500 fill-orange-500" size={20} />
            <span className="font-bold text-orange-500">{stats.streak}</span>
            </div>

            <div className="flex items-center space-x-1">
            <Gem className="text-duo-blue fill-duo-blue" size={20} />
            <span className="font-bold text-duo-blue">{stats.gems}</span>
            </div>

            <div className="flex items-center space-x-1">
            <Heart className="text-red-500 fill-red-500" size={20} />
            <span className="font-bold text-red-500">{stats.hearts}</span>
            </div>
        </div>
        
        {/* Settings Button - Custom Image */}
        <button 
          onClick={onOpenSettings} 
          className="p-1 hover:bg-gray-100 rounded-xl transition-colors ml-2"
        >
            <MiniAvatar config={stats.user?.avatar} />
        </button>
      </div>

      {/* Unlock Leaderboards Box */}
      <div className="border-2 border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="font-bold text-lg text-gray-700 mb-2">Unlock Leaderboards!</h3>
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Shield className="text-yellow-500 fill-yellow-500" size={32} />
          </div>
          <p className="text-gray-500 text-sm leading-tight">Complete 10 more lessons to start competing.</p>
        </div>
      </div>

      {/* Daily Quests Box */}
      <div className="border-2 border-gray-200 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-700">Daily Quests</h3>
            <a href="#" className="text-duo-blue font-bold text-sm uppercase hover:text-duo-blue-dark">View all</a>
        </div>
        
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 flex items-center justify-center">
                         <Flame className="text-orange-500" size={20} />
                    </div>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-gray-700 text-sm">Earn 50 XP</p>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2">
                        <div className="bg-orange-500 h-2.5 rounded-full w-3/4"></div>
                    </div>
                </div>
            </div>

             <div className="flex items-center space-x-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 flex items-center justify-center">
                         <Heart className="text-red-500" size={20} />
                    </div>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-gray-700 text-sm">Score 90% or higher</p>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2">
                        <div className="bg-red-500 h-2.5 rounded-full w-1/4"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="flex justify-center space-x-4 text-gray-300 text-xs font-bold uppercase">
            <a href="#" className="hover:text-gray-400">About</a>
            <a href="#" className="hover:text-gray-400">Blog</a>
            <a href="#" className="hover:text-gray-400">Store</a>
            <a href="#" className="hover:text-gray-400">Careers</a>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
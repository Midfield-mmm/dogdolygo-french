import React from 'react';
import { Shield, Medal, CheckCircle } from 'lucide-react';
import { UserStats, AvatarConfig } from '../types';

interface LeaderboardProps {
  stats: UserStats;
  onStartQuest: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ stats, onStartQuest }) => {
  
  // Helper to render avatar or fallback color
  const UserAvatar = ({ config, name, colorClass }: { config?: AvatarConfig, name: string, colorClass: string }) => {
      if (config) {
        return (
            <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative mr-4" style={{ backgroundColor: config.backgroundColor }}>
                <svg viewBox="0 0 200 200" className="w-full h-full">
                     <path d="M50,160 Q100,160 150,160 Q180,180 180,220 L20,220 Q20,180 50,160" fill={config.shirtColor} />
                     <circle cx="100" cy="100" r="45" fill={config.skinColor} />
                     {config.hairStyle === 'short' && <path d="M60,100 C60,60 140,60 140,100 L140,90 C140,50 60,50 60,90 Z" fill={config.hairColor} />}
                     {config.hairStyle === 'long' && <path d="M60,100 C60,40 140,40 140,100 L145,160 Q100,160 55,160 Z" fill={config.hairColor} />}
                     {config.hairStyle === 'spiky' && <path d="M55,95 L65,70 L75,90 L85,60 L100,85 L115,60 L125,90 L135,70 L145,95 L140,110 L60,110 Z" fill={config.hairColor} />}
                     {config.hairStyle === 'bob' && <path d="M60,110 C50,110 50,60 100,60 C150,60 150,110 140,110 L140,130 Q100,140 60,130 Z" fill={config.hairColor} />}
                     {!config.glasses && <><circle cx="85" cy="95" r="5" fill="#333" /><circle cx="115" cy="95" r="5" fill="#333" /></>}
                     {config.glasses && <g stroke="#333" strokeWidth="3" fill="rgba(255,255,255,0.3)"><circle cx="85" cy="95" r="14" /><circle cx="115" cy="95" r="14" /></g>}
                </svg>
            </div>
        );
      }
      return (
        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold mr-4`}>
             {name.charAt(0)}
        </div>
      );
  };

  // Mock League Data
  const leagueData = [
    { name: "Marie L.", xp: stats.totalXp + 450, avatarColor: "bg-purple-500" },
    { name: "Thomas B.", xp: stats.totalXp + 200, avatarColor: "bg-blue-500" },
    { name: stats.user ? stats.user.firstName : "Moi", xp: stats.totalXp, avatarColor: "bg-duo-green", isMe: true, avatarConfig: stats.user?.avatar },
    { name: "Sophie K.", xp: Math.max(0, stats.totalXp - 150), avatarColor: "bg-red-500" },
    { name: "Jean P.", xp: Math.max(0, stats.totalXp - 300), avatarColor: "bg-yellow-500" },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4 pb-32">
       <div className="text-center mb-8">
            <Shield size={64} className="mx-auto text-yellow-500 fill-yellow-100 mb-4" />
            <h1 className="text-3xl font-extrabold text-gray-700">Ligue Bronze</h1>
            <p className="text-gray-500 font-medium">Top 5 avancent à la Ligue Argent</p>
       </div>

       {/* Quests Section */}
       <div className="border-2 border-gray-200 rounded-2xl p-6 mb-8 bg-white">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Missions & Quêtes</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-duo-blue">
                        <Medal size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Écrivain en herbe</h3>
                        <p className="text-sm text-gray-500">Écrire un article avec l'IA (+30 Gama)</p>
                    </div>
                </div>
                <button 
                    onClick={onStartQuest}
                    className="bg-duo-blue text-white px-4 py-2 rounded-xl font-bold text-sm uppercase shadow-[0_4px_0_0_#1899d6] active:translate-y-1 active:shadow-none"
                >
                    Go
                </button>
            </div>
       </div>

       {/* Ranking List */}
       <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
            {leagueData.map((user, index) => (
                <div key={index} className={`flex items-center p-4 ${user.isMe ? 'bg-green-50' : 'bg-white'} border-b border-gray-100 last:border-0`}>
                    <div className="font-bold text-gray-400 w-8">{index + 1}</div>
                    
                    <UserAvatar name={user.name} colorClass={user.avatarColor} config={user.avatarConfig} />

                    <div className="flex-1 font-bold text-gray-700">
                        {user.name} {user.isMe && <span className="bg-duo-green text-white text-xs px-2 py-0.5 rounded ml-2">MOI</span>}
                    </div>
                    <div className="text-gray-500 font-medium">{user.xp} XP</div>
                </div>
            ))}
       </div>
    </div>
  );
};

export default Leaderboard;
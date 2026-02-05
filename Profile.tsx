import React, { useState } from 'react';
import { User, Lock, LogOut, Calendar, Star, Trophy, Fingerprint, AlertCircle, Edit2 } from 'lucide-react';
import { UserStats, UserProfile, AvatarConfig } from '../types';
import { authenticateUser, registerUser, saveState } from '../utils/storage';
import AvatarEditor from './AvatarEditor';

interface ProfileProps {
  stats: UserStats;
  onLogin: (stats: UserStats) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ stats, onLogin, onLogout }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.password) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    if (isLoginMode) {
        // LOGIN LOGIC
        const loadedStats = authenticateUser(formData.username, formData.password);
        if (loadedStats) {
            onLogin(loadedStats);
        } else {
            setError("Nom d'utilisateur ou mot de passe incorrect.");
        }
    } else {
        // SIGNUP LOGIC
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const profile: UserProfile = {
            id: uniqueId,
            username: formData.username,
            firstName: formData.firstName || 'User',
            lastName: formData.lastName || '',
            password: formData.password,
            joinDate: new Date().toLocaleDateString()
        };

        const newStats = registerUser(profile);
        if (newStats) {
            onLogin(newStats);
        } else {
            setError("Ce nom d'utilisateur est déjà pris.");
        }
    }
  };

  const handleSaveAvatar = (newConfig: AvatarConfig) => {
      if (stats.user) {
          const updatedStats = {
              ...stats,
              user: {
                  ...stats.user,
                  avatar: newConfig
              }
          };
          onLogin(updatedStats); // Updates global state
          saveState(updatedStats); // Persist
          setShowAvatarEditor(false);
      }
  };

  // Helper to render static avatar SVG for profile display
  const AvatarDisplay = ({ config, size = 150 }: { config?: AvatarConfig, size?: number }) => {
      if (!config) return <div className="w-full h-full bg-duo-green flex items-center justify-center text-white font-bold text-4xl">{stats.user?.firstName.charAt(0)}</div>;
      
      return (
        <div className="rounded-full overflow-hidden border-4 border-white shadow-xl relative" style={{ width: size, height: size, backgroundColor: config.backgroundColor }}>
             <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Clothes */}
                <g>
                    <path d="M50,160 Q100,160 150,160 Q180,180 180,220 L20,220 Q20,180 50,160" fill={config.shirtColor} />
                    {config.shirtStyle === 'tshirt' && <path d="M85,160 Q100,180 115,160" stroke="#000" strokeOpacity="0.1" strokeWidth="2" fill="none" />}
                    {config.shirtStyle === 'suit' && (
                        <>
                            <path d="M100,160 L100,220" stroke="#fff" strokeWidth="1" />
                            <path d="M100,160 L85,220 L115,220 Z" fill="#fff" />
                            <path d="M100,160 L90,180 L110,180 Z" fill="#333" />
                        </>
                    )}
                    {config.shirtStyle === 'hoodie' && <path d="M70,160 Q100,190 130,160" stroke="#000" strokeOpacity="0.2" strokeWidth="6" fill="none" />}
                </g>
                {/* Skin */}
                <g>
                    <rect x="85" y="140" width="30" height="40" fill={config.skinColor} />
                    <circle cx="100" cy="100" r="45" fill={config.skinColor} />
                    <circle cx="56" cy="105" r="8" fill={config.skinColor} />
                    <circle cx="144" cy="105" r="8" fill={config.skinColor} />
                </g>
                {/* Hair */}
                <g>
                    {config.hairStyle === 'short' && <path d="M60,100 C60,60 140,60 140,100 L140,90 C140,50 60,50 60,90 Z" fill={config.hairColor} />}
                    {config.hairStyle === 'long' && <path d="M60,100 C60,40 140,40 140,100 L145,160 Q100,160 55,160 Z" fill={config.hairColor} />}
                    {config.hairStyle === 'spiky' && <path d="M55,95 L65,70 L75,90 L85,60 L100,85 L115,60 L125,90 L135,70 L145,95 L140,110 L60,110 Z" fill={config.hairColor} />}
                    {config.hairStyle === 'bob' && <path d="M60,110 C50,110 50,60 100,60 C150,60 150,110 140,110 L140,130 Q100,140 60,130 Z" fill={config.hairColor} />}
                </g>
                {/* Face Features */}
                {config.mouthType === 'smile' && <path d="M85,120 Q100,135 115,120" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />}
                {config.mouthType === 'neutral' && <line x1="90" y1="125" x2="110" y2="125" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
                {config.mouthType === 'open' && <circle cx="100" cy="125" r="8" fill="#552222" />}
                
                {config.beard && <path d="M60,100 Q60,140 100,150 Q140,140 140,100 L140,110 Q140,145 100,155 Q60,145 60,110 Z" fill={config.hairColor} opacity="0.9" />}

                {config.eyeType === 'normal' && <><circle cx="85" cy="95" r="5" fill="#333" /><circle cx="115" cy="95" r="5" fill="#333" /></>}
                {config.eyeType === 'happy' && <><path d="M78,95 Q85,90 92,95" stroke="#333" strokeWidth="3" fill="none" /><path d="M108,95 Q115,90 122,95" stroke="#333" strokeWidth="3" fill="none" /></>}
                {config.eyeType === 'tired' && <><circle cx="85" cy="95" r="5" fill="#333" /><circle cx="115" cy="95" r="5" fill="#333" /><path d="M78,105 Q85,108 92,105" stroke="#000" strokeOpacity="0.2" strokeWidth="2" fill="none" /><path d="M108,105 Q115,108 122,105" stroke="#000" strokeOpacity="0.2" strokeWidth="2" fill="none" /></>}

                {config.glasses && <g stroke="#333" strokeWidth="3" fill="rgba(255,255,255,0.3)"><circle cx="85" cy="95" r="14" /><circle cx="115" cy="95" r="14" /><line x1="99" y1="95" x2="101" y2="95" /><line x1="56" y1="95" x2="71" y2="95" /><line x1="129" y1="95" x2="144" y2="95" /></g>}
             </svg>
        </div>
      );
  };

  if (stats.user) {
    return (
      <div className="max-w-2xl mx-auto pt-8 px-4 pb-32">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-700">Profil</h1>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-500 flex items-center gap-2 font-bold uppercase text-sm">
                <LogOut size={20} /> Déconnexion
            </button>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-8 flex flex-col items-center shadow-sm relative">
            <div className="mb-4 relative group cursor-pointer" onClick={() => setShowAvatarEditor(true)}>
                <AvatarDisplay config={stats.user.avatar} />
                <div className="absolute bottom-0 right-0 bg-duo-blue p-2 rounded-full border-4 border-white shadow-sm group-hover:scale-110 transition-transform">
                    <Edit2 size={16} className="text-white" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800">{stats.user.firstName} {stats.user.lastName}</h2>
            <p className="text-gray-500 font-bold mb-2">@{stats.user.username}</p>
            
            <div className="flex items-center gap-2 text-xs text-gray-300 font-mono bg-gray-50 px-3 py-1 rounded-full mb-6">
                <Fingerprint size={12} /> ID: {stats.user.id}
            </div>
            
            <div className="flex gap-4 w-full">
                <div className="flex-1 p-4 border-2 border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-xs mb-2">
                        <Calendar size={16} /> Depuis
                    </div>
                    <div className="font-bold text-gray-700">{stats.user.joinDate}</div>
                </div>
                <div className="flex-1 p-4 border-2 border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-xs mb-2">
                        <Star size={16} /> Total XP
                    </div>
                    <div className="font-bold text-gray-700">{stats.totalXp}</div>
                </div>
            </div>
        </div>

        <h3 className="font-bold text-xl text-gray-700 mb-4">Statistiques</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-gray-200 rounded-xl flex items-center gap-4">
                <div className="text-yellow-500"><Trophy size={32} /></div>
                <div>
                    <div className="font-bold text-xl">Ligue</div>
                    <div className="text-sm text-gray-500">Bronze</div>
                </div>
            </div>
        </div>

        {showAvatarEditor && (
            <AvatarEditor 
                initialConfig={stats.user.avatar} 
                onSave={handleSaveAvatar} 
                onCancel={() => setShowAvatarEditor(false)} 
            />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-12 px-4">
      <h1 className="text-3xl font-extrabold text-center text-gray-700 mb-8">
        {isLoginMode ? 'Se connecter' : 'Créer un profil'}
      </h1>
      
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
         <p><strong>Info :</strong> Votre progression (Gama, XP, Inventaire) est sauvegardée en permanence sur cet appareil.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 text-red-500 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm font-bold animate-pulse">
            <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginMode && (
             <div className="flex gap-4">
                <input 
                    type="text" 
                    placeholder="Prénom" 
                    className="w-full p-4 bg-gray-100 rounded-xl border-2 border-gray-200 focus:border-duo-blue outline-none"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="Nom" 
                    className="w-full p-4 bg-gray-100 rounded-xl border-2 border-gray-200 focus:border-duo-blue outline-none"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
            </div>
        )}
        
        <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Nom d'utilisateur" 
                className="w-full p-4 pl-12 bg-gray-100 rounded-xl border-2 border-gray-200 focus:border-duo-blue outline-none"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
            />
        </div>

        <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="password" 
                placeholder="Mot de passe" 
                className="w-full p-4 pl-12 bg-gray-100 rounded-xl border-2 border-gray-200 focus:border-duo-blue outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
            />
        </div>

        <button type="submit" className="w-full bg-duo-blue text-white py-4 rounded-xl font-bold text-lg uppercase shadow-[0_4px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all">
            {isLoginMode ? 'Connexion' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }} className="text-duo-blue font-bold uppercase text-sm hover:underline">
            {isLoginMode ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
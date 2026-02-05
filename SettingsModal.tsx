import React, { useState } from 'react';
import { X, Volume2, Bell, User, Globe, LogOut } from 'lucide-react';
import { UserStats } from '../types';

interface SettingsModalProps {
  stats: UserStats;
  onClose: () => void;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ stats, onClose, onLogout }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleNotif = () => setNotifEnabled(!notifEnabled);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg mx-4 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700">Paramètres</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={28} />
          </button>
        </div>
        
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Account Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Compte</h3>
            <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl mb-3">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-duo-green rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {stats.user?.firstName.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{stats.user?.firstName || 'Invité'} {stats.user?.lastName}</div>
                    <div className="text-gray-500 text-sm font-medium">@{stats.user?.username || 'guest'}</div>
                  </div>
               </div>
               <button className="text-duo-blue font-bold uppercase text-sm hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">Modifier</button>
            </div>
            <div className="flex items-center justify-between px-2">
               <div className="font-bold text-gray-700">Se déconnecter</div>
               <button onClick={() => { onLogout(); onClose(); }} className="flex items-center gap-2 text-red-500 font-bold uppercase text-sm hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                  <LogOut size={18} /> Déconnexion
               </button>
            </div>
          </section>

          {/* Preferences */}
          <section className="border-t-2 border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Préférences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 font-bold text-gray-700">
                    <Volume2 className="text-gray-400" /> Effets sonores
                 </div>
                 <div onClick={toggleSound} className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${soundEnabled ? 'bg-duo-green' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
              </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 font-bold text-gray-700">
                    <Bell className="text-gray-400" /> Rappels d'entraînement
                 </div>
                  <div onClick={toggleNotif} className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${notifEnabled ? 'bg-duo-green' : 'bg-gray-300'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${notifEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
              </div>
            </div>
          </section>

           {/* General */}
          <section className="border-t-2 border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Général</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                 <div className="font-bold text-gray-700">Abonnement Super DogDoly</div>
                 <span className="text-duo-blue font-bold uppercase text-sm">Gérer</span>
              </div>
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                 <div className="font-bold text-gray-700">Cours de langue</div>
                 <div className="flex items-center gap-2">
                    <Globe size={18} className="text-gray-400" />
                    <span className="text-gray-500 font-bold text-sm">Français (depuis Thaï)</span>
                 </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">DogDolyGO! v1.294.0</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
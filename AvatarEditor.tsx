import React, { useState } from 'react';
import { AvatarConfig } from '../types';
import { X, Check, RefreshCw } from 'lucide-react';

interface AvatarEditorProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
}

const DEFAULT_AVATAR: AvatarConfig = {
    skinColor: '#f5d0b0',
    hairColor: '#4a3b2a',
    hairStyle: 'short',
    shirtColor: '#58cc02',
    shirtStyle: 'tshirt',
    eyeType: 'normal',
    glasses: false,
    beard: false,
    mouthType: 'smile',
    backgroundColor: '#e5e5e5'
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'clothes' | 'face' | 'bg'>('skin');

  // --- SVG RENDERERS ---

  const renderSkin = () => (
    <g id="skin">
      {/* Neck */}
      <rect x="85" y="140" width="30" height="40" fill={config.skinColor} />
      {/* Head */}
      <circle cx="100" cy="100" r="45" fill={config.skinColor} />
      {/* Ears */}
      <circle cx="56" cy="105" r="8" fill={config.skinColor} />
      <circle cx="144" cy="105" r="8" fill={config.skinColor} />
    </g>
  );

  const renderEyes = () => {
    return (
      <g id="eyes">
        {config.eyeType === 'normal' && (
          <>
            <circle cx="85" cy="95" r="5" fill="#333" />
            <circle cx="115" cy="95" r="5" fill="#333" />
            <path d="M75,85 Q85,80 95,85" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M105,85 Q115,80 125,85" stroke="#333" strokeWidth="2" fill="none" />
          </>
        )}
        {config.eyeType === 'happy' && (
          <>
            <path d="M78,95 Q85,90 92,95" stroke="#333" strokeWidth="3" fill="none" />
            <path d="M108,95 Q115,90 122,95" stroke="#333" strokeWidth="3" fill="none" />
          </>
        )}
        {config.eyeType === 'tired' && (
          <>
            <circle cx="85" cy="95" r="5" fill="#333" />
            <circle cx="115" cy="95" r="5" fill="#333" />
            <path d="M78,105 Q85,108 92,105" stroke="#000" strokeOpacity="0.2" strokeWidth="2" fill="none" />
            <path d="M108,105 Q115,108 122,105" stroke="#000" strokeOpacity="0.2" strokeWidth="2" fill="none" />
          </>
        )}
      </g>
    );
  };

  const renderMouth = () => {
    return (
        <g id="mouth">
             {config.mouthType === 'smile' && (
                 <path d="M85,120 Q100,135 115,120" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
             )}
             {config.mouthType === 'neutral' && (
                 <line x1="90" y1="125" x2="110" y2="125" stroke="#333" strokeWidth="3" strokeLinecap="round" />
             )}
             {config.mouthType === 'open' && (
                 <circle cx="100" cy="125" r="8" fill="#552222" />
             )}
        </g>
    );
  };

  const renderBeard = () => {
      if (!config.beard) return null;
      return (
          <path d="M60,100 Q60,140 100,150 Q140,140 140,100 L140,110 Q140,145 100,155 Q60,145 60,110 Z" fill={config.hairColor} opacity="0.9" />
      );
  };

  const renderGlasses = () => {
      if (!config.glasses) return null;
      return (
          <g id="glasses" stroke="#333" strokeWidth="3" fill="rgba(255,255,255,0.3)">
              <circle cx="85" cy="95" r="14" />
              <circle cx="115" cy="95" r="14" />
              <line x1="99" y1="95" x2="101" y2="95" />
              <line x1="56" y1="95" x2="71" y2="95" />
              <line x1="129" y1="95" x2="144" y2="95" />
          </g>
      );
  };

  const renderHair = () => {
      const c = config.hairColor;
      return (
          <g id="hair">
              {config.hairStyle === 'short' && (
                  <path d="M60,100 C60,60 140,60 140,100 L140,90 C140,50 60,50 60,90 Z" fill={c} />
              )}
              {config.hairStyle === 'long' && (
                  <path d="M60,100 C60,40 140,40 140,100 L145,160 Q100,160 55,160 Z" fill={c} />
              )}
              {config.hairStyle === 'spiky' && (
                  <path d="M55,95 L65,70 L75,90 L85,60 L100,85 L115,60 L125,90 L135,70 L145,95 L140,110 L60,110 Z" fill={c} />
              )}
              {config.hairStyle === 'bob' && (
                  <path d="M60,110 C50,110 50,60 100,60 C150,60 150,110 140,110 L140,130 Q100,140 60,130 Z" fill={c} />
              )}
          </g>
      );
  };

  const renderClothes = () => {
      const c = config.shirtColor;
      return (
          <g id="clothes">
              {/* Shoulders */}
              <path d="M50,160 Q100,160 150,160 Q180,180 180,220 L20,220 Q20,180 50,160" fill={c} />
              {config.shirtStyle === 'tshirt' && (
                   <path d="M85,160 Q100,180 115,160" stroke="#000" strokeOpacity="0.1" strokeWidth="2" fill="none" />
              )}
              {config.shirtStyle === 'suit' && (
                  <>
                    <path d="M100,160 L100,220" stroke="#fff" strokeWidth="1" />
                    <path d="M100,160 L85,220 L115,220 Z" fill="#fff" />
                    <path d="M100,160 L90,180 L110,180 Z" fill="#333" /> {/* Tie */}
                  </>
              )}
              {config.shirtStyle === 'hoodie' && (
                   <path d="M70,160 Q100,190 130,160" stroke="#000" strokeOpacity="0.2" strokeWidth="6" fill="none" />
              )}
          </g>
      );
  };

  // --- UI CONTROLS ---

  const Colors = ({ current, onChange, options }: { current: string, onChange: (c: string) => void, options: string[] }) => (
      <div className="flex flex-wrap gap-2 mt-2">
          {options.map(c => (
              <button 
                key={c} 
                onClick={() => onChange(c)} 
                className={`w-8 h-8 rounded-full border-2 ${current === c ? 'border-black scale-110' : 'border-gray-200'}`}
                style={{ backgroundColor: c }}
              />
          ))}
      </div>
  );

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-xl font-extrabold text-gray-700">Éditeur d'Avatar</h2>
            <div className="flex gap-2">
                <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <X />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
            {/* Preview Area */}
            <div className="bg-gray-50 p-6 flex justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-white shadow-xl overflow-hidden relative" style={{ backgroundColor: config.backgroundColor }}>
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                        {renderClothes()}
                        {renderSkin()}
                        {renderHair()}
                        {renderMouth()}
                        {renderBeard()}
                        {renderEyes()}
                        {renderGlasses()}
                    </svg>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {['skin', 'hair', 'face', 'clothes', 'bg'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-3 px-4 text-sm font-bold uppercase transition-colors whitespace-nowrap
                            ${activeTab === tab ? 'text-duo-blue border-b-2 border-duo-blue bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}
                        `}
                    >
                        {tab === 'skin' ? 'Corps' : tab === 'hair' ? 'Cheveux' : tab === 'face' ? 'Visage' : tab === 'clothes' ? 'Habits' : 'Fond'}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="p-6 space-y-6">
                
                {activeTab === 'skin' && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Couleur de peau</h3>
                        <Colors 
                            current={config.skinColor} 
                            onChange={(c) => setConfig({...config, skinColor: c})}
                            options={['#f5d0b0', '#eec090', '#e0ac69', '#cf9658', '#a87548', '#8c5a33', '#5c3a1e', '#3b2515', '#f3e4d4']}
                        />
                    </div>
                )}

                {activeTab === 'hair' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Style</h3>
                            <div className="flex flex-wrap gap-2">
                                {['short', 'long', 'spiky', 'bob', 'bald'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setConfig({...config, hairStyle: s as any})}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold capitalize ${config.hairStyle === s ? 'border-duo-blue bg-blue-50 text-duo-blue' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        {s === 'bald' ? 'Chauve' : s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Couleur</h3>
                            <Colors 
                                current={config.hairColor} 
                                onChange={(c) => setConfig({...config, hairColor: c})}
                                options={['#222', '#4a3b2a', '#8c5a33', '#a87548', '#d4a045', '#e6c27e', '#9e9e9e', '#fff', '#e91e63', '#2196f3']}
                            />
                        </div>
                        <div>
                             <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Barbe</h3>
                             <button 
                                onClick={() => setConfig({...config, beard: !config.beard})}
                                className={`px-4 py-2 rounded-xl border-2 font-bold ${config.beard ? 'border-duo-green bg-green-50 text-duo-green' : 'border-gray-200'}`}
                             >
                                 {config.beard ? 'Avec Barbe' : 'Sans Barbe'}
                             </button>
                        </div>
                    </div>
                )}

                {activeTab === 'face' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Yeux</h3>
                            <div className="flex gap-2">
                                {['normal', 'happy', 'tired'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setConfig({...config, eyeType: t as any})}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold capitalize ${config.eyeType === t ? 'border-duo-blue bg-blue-50 text-duo-blue' : 'border-gray-200'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Bouche</h3>
                            <div className="flex gap-2">
                                {['smile', 'neutral', 'open'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setConfig({...config, mouthType: t as any})}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold capitalize ${config.mouthType === t ? 'border-duo-blue bg-blue-50 text-duo-blue' : 'border-gray-200'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Accessoires</h3>
                             <button 
                                onClick={() => setConfig({...config, glasses: !config.glasses})}
                                className={`px-4 py-2 rounded-xl border-2 font-bold ${config.glasses ? 'border-duo-blue bg-blue-50 text-duo-blue' : 'border-gray-200'}`}
                             >
                                 {config.glasses ? 'Lunettes' : 'Sans lunettes'}
                             </button>
                        </div>
                    </div>
                )}

                {activeTab === 'clothes' && (
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Type</h3>
                             <div className="flex gap-2">
                                {['tshirt', 'hoodie', 'suit'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setConfig({...config, shirtStyle: t as any})}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold capitalize ${config.shirtStyle === t ? 'border-duo-blue bg-blue-50 text-duo-blue' : 'border-gray-200'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Couleur</h3>
                            <Colors 
                                current={config.shirtColor} 
                                onChange={(c) => setConfig({...config, shirtColor: c})}
                                options={['#58cc02', '#1cb0f6', '#ff4b4b', '#ffc800', '#222', '#fff', '#9333ea', '#ea580c']}
                            />
                        </div>
                    </div>
                )}

                 {activeTab === 'bg' && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Couleur de fond</h3>
                        <Colors 
                            current={config.backgroundColor} 
                            onChange={(c) => setConfig({...config, backgroundColor: c})}
                            options={['#e5e5e5', '#58cc02', '#1cb0f6', '#ff4b4b', '#ffc800', '#a855f7', '#ec4899', '#14b8a6']}
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-4">
             <button 
                onClick={onCancel}
                className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors uppercase tracking-widest"
            >
                Annuler
            </button>
            <button 
                onClick={() => onSave(config)}
                className="flex-1 bg-duo-green text-white py-3 rounded-xl font-bold uppercase tracking-widest shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
                <Check size={20} /> Sauvegarder
            </button>
        </div>

      </div>
    </div>
  );
};

export default AvatarEditor;
import React from 'react';

interface SpeakingCharacterProps {
  imageSrc: string;
  isSpeaking: boolean; // Kept for compatibility, but mainly we use audioLevel if provided
  audioLevel?: number; // 0 to 1
  className?: string;
}

const SpeakingCharacter: React.FC<SpeakingCharacterProps> = ({ imageSrc, isSpeaking, audioLevel = 0, className = "" }) => {
  
  // If no audioLevel is provided but isSpeaking is true (e.g. TTS), use a fallback random value in render?
  // Actually, we'll let the parent handle the audioLevel via the hook. 
  // If only isSpeaking is true (legacy/TTS), we simulate a simple pulse.
  
  const activeLevel = audioLevel > 0.01 ? audioLevel : (isSpeaking ? 0.5 : 0);

  // Transform calculation
  // We want the jaw to drop (or the whole head to squash/stretch) based on volume.
  // ScaleY < 1 makes it look like squash (mouth closing/opening depending on pivot)
  // Let's do a "Muppet" style: simple vertical scaling anchored at bottom.
  // 1.0 = closed. 1.15 = open (stretched vertically) OR 0.9 (squashed).
  
  // Let's try: Stretching Y slightly and Scaling X slightly inverse to preserve volume feel.
  const scaleY = 1 + (activeLevel * 0.12);
  const scaleX = 1 - (activeLevel * 0.05);
  const translateY = -(activeLevel * 5); // Move up slightly when "opening" to keep feet planted if anchored bottom

  return (
    <div className={`relative flex justify-center items-end ${className}`}>
        {/* LypSinc Badge for visual confirmation of the "tech" */}
        {activeLevel > 0 && (
            <div className="absolute top-0 right-0 bg-black/80 text-white text-[8px] font-mono px-1 rounded z-20 opacity-50">
                LYPSINC ACTIVE
            </div>
        )}
        
        <img 
            src={imageSrc} 
            alt="Character" 
            className="w-40 h-40 object-contain drop-shadow-xl transition-transform duration-75 ease-out will-change-transform"
            style={{
                transformOrigin: 'bottom center',
                transform: `scale(${scaleX}, ${scaleY}) translateY(${translateY}px)`
            }}
        />
        
        {/* Dynamic Sound Waves based on real level */}
        {activeLevel > 0.1 && (
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex gap-1 items-end h-8">
                <div className="w-1 bg-gray-400 rounded-full transition-all duration-75" style={{ height: `${activeLevel * 80}%` }}></div>
                <div className="w-1 bg-gray-400 rounded-full transition-all duration-75 delay-75" style={{ height: `${activeLevel * 50}%` }}></div>
                <div className="w-1 bg-gray-400 rounded-full transition-all duration-75 delay-100" style={{ height: `${activeLevel * 100}%` }}></div>
            </div>
        )}
    </div>
  );
};

export default SpeakingCharacter;
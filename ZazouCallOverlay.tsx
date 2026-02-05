import React, { useState, useEffect, useRef } from 'react';
import { X, PhoneOff, Mic, MicOff, Video, VideoOff, Loader2, Award, Volume2, MessageSquare, Play } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { soundManager } from '../utils/sound';
import SpeakingCharacter from './SpeakingCharacter';

interface ZazouCallOverlayProps {
  unitTitle: string;
  unitNumber: number;
  onClose: () => void;
  onComplete: (correctCount: number, aiScore: number) => void;
}

const ZazouCallOverlay: React.FC<ZazouCallOverlayProps> = ({ unitTitle, unitNumber, onClose, onComplete }) => {
  const [status, setStatus] = useState<'ringing' | 'connected' | 'evaluating'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [transcript, setTranscript] = useState<{ role: 'zazou' | 'user', text: string }[]>([]);
  const [isZazouSpeaking, setIsZazouSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [topic, setTopic] = useState("");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Helpers pour le décodage audio PCM brut (requis par le SDK Gemini TTS)
  function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function playRawPcm(base64Data: string) {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const pcmData = decodeBase64(base64Data);
    const dataInt16 = new Int16Array(pcmData.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    // Animation LipSync basée sur l'analyseur
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const animate = () => {
      if (!setIsZazouSpeaking) return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(avg / 128);
      if (source.onended === null) requestAnimationFrame(animate);
    };

    setIsZazouSpeaking(true);
    source.start();
    animate();

    source.onended = () => {
      setIsZazouSpeaking(false);
      setAudioLevel(0);
    };
  }

  const getZazouResponse = async (userText: string | null) => {
    try {
      const prompt = userText 
        ? `L'utilisateur dit : "${userText}". Réponds comme Zazou, une amie chatte élégante et encourageante. Parle de : ${topic}. Reste courte.`
        : `Lance la conversation sur le sujet : ${topic}. Présente-toi comme Zazou.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
          },
          systemInstruction: "Tu es Zazou, une chatte qui adore le français. Ton élève parle Thaï. Sois amicale, utilise des émojis dans ton 'esprit' mais parle un français clair et simple. Tu es en appel vidéo."
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const textResponse = response.text || "C'est merveilleux ! Continue.";
      
      setTranscript(prev => [...prev, { role: 'zazou', text: textResponse }]);
      if (audioData) await playRawPcm(audioData);
    } catch (e) {
      console.error("Zazou Error:", e);
    }
  };

  const startCall = async () => {
    setStatus('connected');
    soundManager.playPop();
    
    // Générer un sujet basé sur l'unité
    const topicResp = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Génère un sujet de conversation amusant pour un élève de français niveau B1. Thème de l'unité : ${unitTitle}. Juste le sujet en une phrase.`
    });
    const newTopic = topicResp.text || "Tes passions secrètes";
    setTopic(newTopic);
    
    await getZazouResponse(null);
  };

  const endCall = async () => {
    setStatus('evaluating');
    // Analyse finale
    const conversation = transcript.map(t => `${t.role}: ${t.text}`).join('\n');
    const evalResp = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse cette conversation de pratique du français. Donne un score sur 25 et un feedback court. \n\n${conversation}`
    });
    
    const scoreMatch = evalResp.text?.match(/(\d+)\/25/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 20;
    
    soundManager.playComplete();
    setTimeout(() => onComplete(transcript.length, score), 2000);
  };

  // Recording Logic (Simplified for this block)
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        // Utiliser Gemini pour transcrire et répondre
        const resp = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                { text: "Retranscris exactement ce que l'utilisateur a dit en français." },
                { inlineData: { mimeType: 'audio/webm', data: base64 } }
            ]
        });
        const userText = resp.text || "";
        if (userText) {
          setTranscript(prev => [...prev, { role: 'user', text: userText }]);
          getZazouResponse(userText);
        }
      };
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    let timer: any;
    if (status === 'connected' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      endCall();
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-6 text-white animate-in fade-in duration-500 overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Header Info */}
      <div className="w-full flex justify-between items-center max-w-4xl z-10">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <div className="flex flex-col">
                <span className="font-black uppercase text-xs tracking-tighter text-slate-400">Appel Vidéo HD</span>
                <span className="font-mono text-sm">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sujet du jour</p>
            <p className="text-sm font-bold text-pink-300 italic">"{topic || 'Chargement...'}"</p>
        </div>
      </div>

      {/* Zazou Portrait */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full z-10">
        <div className="relative">
            {/* Call Ringing Effect */}
            {status === 'ringing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-pink-500/30 rounded-full animate-ping" />
                    <div className="w-64 h-64 border-2 border-pink-500/20 rounded-full animate-ping delay-700" />
                </div>
            )}
            
            <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-white/10 overflow-hidden bg-slate-900 shadow-2xl transition-all duration-700 ${status === 'connected' ? 'scale-100' : 'scale-90 opacity-80'}`}>
                <SpeakingCharacter 
                    imageSrc="https://i.postimg.cc/8P3McSdW/1m.png" // Image de Zazou (utilisons celle de Lisa pour l'instant ou une variante)
                    isSpeaking={isZazouSpeaking} 
                    audioLevel={audioLevel}
                    className="w-full h-full scale-125 translate-y-4"
                />
            </div>

            {isZazouSpeaking && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-pink-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                    Zazou parle...
                </div>
            )}
        </div>
        
        <h2 className="text-3xl font-black mt-8 tracking-tighter">Zazou</h2>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Chatte Polyglotte</p>
      </div>

      {/* User Mini Preview */}
      <div className="absolute bottom-32 right-8 w-32 h-44 bg-slate-800 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden z-20">
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                <div className="w-12 h-12 bg-duo-blue rounded-full flex items-center justify-center mb-2">
                    <User size={24} className="text-white" />
                </div>
                <div className="flex gap-1 items-end h-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className={`w-1 bg-duo-blue rounded-full transition-all ${mediaRecorderRef.current?.state === 'recording' ? 'animate-bounce' : 'h-1'}`} style={{ animationDelay: `${i*0.1}s`, height: mediaRecorderRef.current?.state === 'recording' ? '100%' : '10%' }} />
                    ))}
                </div>
          </div>
      </div>

      {/* Transcription Overlay */}
      {transcript.length > 0 && status === 'connected' && (
        <div className="absolute left-8 bottom-32 max-w-md bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 z-20 space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
            {transcript.slice(-2).map((m, i) => (
                <div key={i} className={`flex gap-2 items-start animate-in slide-in-from-left-4`}>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${m.role === 'zazou' ? 'bg-pink-500' : 'bg-duo-blue'}`}>{m.role}</span>
                    <p className="text-sm font-medium opacity-90">{m.text}</p>
                </div>
            ))}
        </div>
      )}

      {/* Controls */}
      <div className="w-full max-w-lg flex items-center justify-center gap-8 pb-8 z-30">
        {status === 'ringing' ? (
             <button 
                onClick={startCall}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:bg-green-600 active:scale-90 transition-all animate-bounce"
             >
                <Video size={36} className="text-white" />
             </button>
        ) : (
            <>
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white border border-white/20'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button 
                    onClick={endCall}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 active:scale-90 transition-all group"
                >
                    <PhoneOff size={36} className="text-white group-hover:rotate-12 transition-transform" />
                </button>

                <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={isZazouSpeaking}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isZazouSpeaking ? 'opacity-20 bg-white/5 cursor-not-allowed' : 'bg-duo-blue text-white shadow-lg active:scale-125'}`}
                >
                    <MessageSquare size={24} />
                </button>
            </>
        )}
      </div>

      {/* Evaluation State */}
      {status === 'evaluating' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-[110] p-8 text-center">
            <Loader2 className="animate-spin text-pink-500 mb-6" size={64} />
            <h2 className="text-3xl font-black mb-2">Zazou analyse votre appel...</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Veuillez patienter</p>
        </div>
      )}
    </div>
  );
};

export default ZazouCallOverlay;

// Petit helper manquant pour l'icône User
const User = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
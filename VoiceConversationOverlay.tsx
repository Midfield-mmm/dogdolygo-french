import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { X, Mic, MicOff, PhoneOff, Bot, User, MessageSquare, Loader2, Play, AlertCircle } from 'lucide-react';

interface VoiceConversationOverlayProps {
  onClose: () => void;
}

const VoiceConversationOverlay: React.FC<VoiceConversationOverlayProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error' | 'closed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscription, setShowTranscription] = useState(true);
  const [transcription, setTranscription] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const streamRef = useRef<MediaStream | null>(null);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  const startSession = async () => {
    setStatus('connecting');
    setErrorMessage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Requesting microphone - this must be triggered by a user click
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              if (isMutedRef.current) return;
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContextRef.current,
                24000,
                1,
              );
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const u = currentInputTranscription.current;
              const m = currentOutputTranscription.current;
              if (u || m) {
                setTranscription(prev => [
                  ...prev,
                  ...(u ? [{ role: 'user' as const, text: u }] : []),
                  ...(m ? [{ role: 'model' as const, text: m }] : [])
                ]);
              }
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setStatus('error');
            setErrorMessage("Une erreur de connexion est survenue.");
          },
          onclose: (e: any) => {
            setStatus('closed');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "Tu es Duo, un tuteur de français amical. Engage une conversation naturelle et bienveillante. Ton interlocuteur parle Thaï. Utilise des phrases simples. Si besoin, explique brièvement en Thaï.",
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to init voice session:', err);
      setStatus('error');
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setErrorMessage("L'accès au micro a été refusé. Veuillez autoriser le micro dans votre navigateur.");
      } else {
        setErrorMessage("Impossible de démarrer la session vocale.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (inputAudioContextRef.current) inputAudioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-300">
      <div className="w-full flex justify-between items-center max-w-2xl">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-gray-500'}`} />
            <span className="font-bold uppercase tracking-widest text-xs text-slate-400">
                {status === 'active' ? 'En ligne' : status === 'connecting' ? 'Connexion...' : status === 'error' ? 'Erreur' : 'Prêt'}
            </span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-md">
         {status === 'active' && (
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-48 h-48 bg-duo-blue/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute w-32 h-32 border-4 border-duo-blue/30 rounded-full animate-ping duration-[2000ms]" />
           </div>
         )}
         
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 overflow-hidden">
                <Bot size={48} className="text-duo-blue" />
            </div>
            
            {status === 'idle' ? (
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-extrabold">Prêt à discuter ?</h2>
                <p className="text-slate-400 max-w-xs mx-auto">
                  Cliquez sur le bouton ci-dessous pour autoriser le micro et commencer à parler avec Duo.
                </p>
                <button 
                  onClick={startSession}
                  className="bg-duo-blue text-white px-8 py-4 rounded-2xl font-bold uppercase shadow-[0_4px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 mx-auto text-lg"
                >
                  <Play size={24} fill="white" /> Commencer
                </button>
              </div>
            ) : status === 'error' ? (
              <div className="text-center space-y-4">
                <div className="bg-red-500/20 p-4 rounded-2xl border-2 border-red-500/50 flex items-center gap-3 text-red-200 mb-4">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="text-sm font-bold text-left">{errorMessage}</p>
                </div>
                <button 
                  onClick={startSession}
                  className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold uppercase transition-all hover:bg-slate-100"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-center">Conversation avec Duo</h2>
                <p className="text-slate-400 mt-2 text-center max-w-xs">
                  {status === 'connecting' ? "Duo se prépare..." : "Parlez naturellement, Duo vous écoute."}
                </p>
              </>
            )}
         </div>
      </div>

      {showTranscription && transcription.length > 0 && status === 'active' && (
        <div className="w-full max-w-xl max-h-48 overflow-y-auto mb-8 space-y-3 px-4 scrollbar-hide bg-black/20 rounded-2xl p-4">
             {transcription.slice(-3).map((msg, i) => (
                <div key={i} className={`flex gap-3 animate-in slide-in-from-bottom-2 ${msg.role === 'user' ? 'text-blue-300' : 'text-white'}`}>
                    <span className="opacity-50 shrink-0 uppercase text-[10px] font-bold mt-1">
                        {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </span>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                </div>
             ))}
        </div>
      )}

      {status !== 'idle' && (
        <div className="w-full max-w-md flex items-center justify-center gap-6 pb-4">
          <button 
              onClick={() => setShowTranscription(!showTranscription)}
              className={`p-4 rounded-full transition-all ${showTranscription ? 'bg-white/10 text-white' : 'bg-transparent text-slate-500 border-2 border-slate-800'}`}
          >
              <MessageSquare size={24} />
          </button>

          <button 
              onClick={onClose}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 active:scale-95 transition-all group"
          >
              <PhoneOff size={32} className="text-white group-hover:rotate-12 transition-transform" />
          </button>

          <button 
              onClick={() => setIsMuted(!isMuted)}
              disabled={status !== 'active'}
              className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white'} disabled:opacity-50`}
          >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>
      )}

      {status === 'connecting' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-[110]">
            <Loader2 className="animate-spin text-duo-blue mb-4" size={48} />
            <p className="font-bold text-lg tracking-tight">Initialisation de Gemini Live...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceConversationOverlay;
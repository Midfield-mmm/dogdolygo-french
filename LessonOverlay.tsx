import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Check, ArrowRight, Loader2, Flag, Mic, Square, Play, RefreshCcw, FileText, Clock, Search } from 'lucide-react';
import { Exercise, ExerciseType, Mistake } from '../types';
import { generateLessonExercises, generateWritingPrompt, evaluateWriting, generateSpeakingPrompt, evaluateSpeaking, generatePracticeExercises, generatePersonalizedLesson } from '../services/geminiService';
import { soundManager } from '../utils/sound';
import { MOCK_UNITS } from '../constants';
import SpeakingCharacter from './SpeakingCharacter';
import { useLipSync } from '../hooks/useLipSync';

interface LessonOverlayProps {
  topic: string;
  unitNumber?: number;
  onClose: () => void;
  onComplete: (correctCount: number, aiScore?: number, mistakes?: Mistake[]) => void;
  lessonId?: string;
  userMistakes?: Mistake[]; // Passed only when generating personalized lessons
}

const LessonOverlay: React.FC<LessonOverlayProps> = ({ topic, unitNumber, onClose, onComplete, lessonId, userMistakes }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<'none' | 'correct' | 'wrong' | 'analyzing'>('none');
  const [hearts, setHearts] = useState(5);
  const [feedback, setFeedback] = useState<string>("");
  const [correctCount, setCorrectCount] = useState(0);
  const [aiScore, setAiScore] = useState<number | undefined>(undefined);
  const [sessionMistakes, setSessionMistakes] = useState<Mistake[]>([]);
  
  // Audio Refs for LipSync
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLevel = useLipSync(audioRef);
  
  // LipSync State (Fallback for TTS)
  const [isCharacterSpeaking, setIsCharacterSpeaking] = useState(false);

  // Writing Mode State
  const [writingText, setWritingText] = useState("");
  const [timeLeft, setTimeLeft] = useState(20 * 60); 
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Investigation Mode State (Unit 10)
  const [showReadingIntro, setShowReadingIntro] = useState(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(300); // 5 minutes

  // Speaking Mode State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      let foundExercises: Exercise[] = [];
      
      // 1. Check for AI Personalized Practice
      if (lessonId === 'practice_ai_personalized' && userMistakes) {
          try {
             const aiExercises = await generatePersonalizedLesson(userMistakes);
             foundExercises = aiExercises;
          } catch (e) {
             console.error("AI Generation failed", e);
             // Fallback
             foundExercises = await generateLessonExercises("Révision");
          }
      }
      // 2. Check for Standard Practice Requests
      else if (lessonId && lessonId.startsWith('practice_')) {
          const practiceData = await generatePracticeExercises(lessonId);
          foundExercises = practiceData;
      }
      // 3. Check for Quest
      else if (lessonId === 'quest_writing') {
          foundExercises = [{ type: 'writing', question: "AI Generated Topic", correctAnswer: "" }];
      } 
      // 4. Check for Hardcoded/Mock Unit Content
      else if (lessonId) {
        for (const unit of MOCK_UNITS) {
          const lesson = unit.lessons.find(l => l.id === lessonId);
          if (lesson && lesson.exercises) {
            foundExercises = JSON.parse(JSON.stringify(lesson.exercises));
            break;
          }
        }
      }

      // 5. Initialize Content
      if (foundExercises.length > 0) {
        try {
            if (foundExercises[0].type === 'writing') {
                if (foundExercises[0].question === "AI Generated Topic") {
                     const prompt = await generateWritingPrompt();
                     foundExercises[0].question = prompt;
                }
                setIsTimerActive(true);
            } else if (foundExercises[0].type === 'speaking') {
                if (foundExercises[0].question === "AI Generated Topic") {
                    const prompt = await generateSpeakingPrompt();
                    foundExercises[0].question = prompt;
                }
            }
        } catch (e) {
            console.error("Failed to generate prompt", e);
        }
        setExercises(foundExercises);
        
        // Setup Unit 10 Reading Phase
        if (unitNumber === 10) {
            setShowReadingIntro(true);
        }

      } else {
        // 6. Fallback Generic Generation
        const data = await generateLessonExercises(topic);
        setExercises(data);
      }
      setLoading(false);
    };
    loadContent();
  }, [topic, lessonId, unitNumber]);

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  // Reading Timer for Unit 10
  useEffect(() => {
      let interval: any;
      if (showReadingIntro && readingTimeLeft > 0) {
          interval = setInterval(() => {
              setReadingTimeLeft(prev => prev - 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [showReadingIntro, readingTimeLeft]);

  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0;

  const playTTS = (text: string) => {
    setIsCharacterSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; 
    utterance.onend = () => setIsCharacterSpeaking(false);
    utterance.onerror = () => setIsCharacterSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleOptionSelect = (option: string) => {
    if (checkStatus !== 'none') return;
    soundManager.playPop();
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (!currentExercise) return;

    if (currentExercise.type !== 'writing' && currentExercise.type !== 'speaking') {
        if (!selectedOption) return;
        if (selectedOption === currentExercise.correctAnswer) {
            setCheckStatus('correct');
            soundManager.playCorrect();
            setCorrectCount(prev => prev + 1);
        } else {
            setCheckStatus('wrong');
            soundManager.playWrong();
            setHearts(h => Math.max(0, h - 1));
            
            // Record Mistake
            setSessionMistakes(prev => [...prev, {
                question: currentExercise.question,
                userAnswer: selectedOption,
                correctAnswer: currentExercise.correctAnswer || "",
                type: currentExercise.type,
                timestamp: Date.now()
            }]);
        }
    }
  };

  const extractScore = (text: string): number => {
      const match = text.match(/(\d+)\/25/);
      return match ? parseInt(match[1]) : 18; 
  };

  const handleSubmitWriting = async () => {
    setIsTimerActive(false);
    setCheckStatus('analyzing');
    const result = await evaluateWriting(writingText, currentExercise.question);
    const score = extractScore(result);
    setAiScore(score);
    setFeedback(result);
    setCheckStatus('correct'); 
    soundManager.playComplete();
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        alert("Microphone access denied. Please enable microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleSubmitSpeaking = async () => {
      // Real analysis enabled for all speaking exercises, including Practice
      if (!audioBlob) return;
      
      setCheckStatus('analyzing');
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Content = base64data.split(',')[1];
          const result = await evaluateSpeaking(base64Content, currentExercise.question);
          const score = extractScore(result);
          
          setAiScore(score);
          setFeedback(result);
          
          // Determine success based on AI score
          if (score >= 15) {
             setCheckStatus('correct');
             soundManager.playCorrect();
             setCorrectCount(prev => prev + 1);
          } else {
             // If score is too low, we mark it as "wrong" visually but still allow continuing
             setCheckStatus('correct'); // Using 'correct' state to show feedback panel, but score is low
             soundManager.playComplete(); // Play neutral/complete sound
          }
      };
  };

  const handleNext = () => {
    // Reset states
    setIsCharacterSpeaking(false);
    window.speechSynthesis.cancel();
    
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCheckStatus('none');
      setSelectedOption(null);
      setFeedback("");
      setWritingText("");
      setAudioBlob(null);
      setIsRecording(false);
    } else {
      soundManager.playComplete();
      // Pass sessionMistakes to onComplete
      setTimeout(() => onComplete(correctCount, aiScore, sessionMistakes), 1500);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-4">
        <img 
            src="https://i.postimg.cc/90fppsLT/Screenshot-2025-12-17-09-30-34.png" 
            alt="Chargement..." 
            className="max-w-full max-h-full object-contain animate-pulse" 
        />
      </div>
    );
  }

  if (exercises.length === 0) return null;

  // UNIT 10: READING PHASE
  if (showReadingIntro && exercises[0]?.contextText) {
      return (
          <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                  <button onClick={onClose}><X size={28} className="text-gray-400" /></button>
                  <div className="flex items-center space-x-2 text-yellow-400 font-bold text-xl animate-pulse">
                      <Clock size={24} />
                      <span>{Math.floor(readingTimeLeft / 60)}:{(readingTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
              </div>

              <div className="max-w-3xl mx-auto w-full">
                <div className="text-center mb-8">
                    <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-yellow-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2">Dossier d'Enquête</h1>
                    <p className="text-gray-400">Lisez attentivement le rapport avant d'interroger les suspects.</p>
                </div>

                <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-700 shadow-2xl mb-8 leading-loose font-serif text-lg text-gray-200">
                    {exercises[0].contextText}
                </div>

                <div className="flex justify-center pb-8">
                    <button 
                        onClick={() => setShowReadingIntro(false)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-12 py-4 rounded-xl font-extrabold uppercase shadow-[0_4px_0_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                    >
                        <Search size={20} /> Commencer l'enquête
                    </button>
                </div>
              </div>
          </div>
      );
  }

  // Writing
  if (currentExercise.type === 'writing') {
      const wordCount = writingText.trim().split(/\s+/).filter(w => w.length > 0).length;
      return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col p-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <button onClick={onClose}><X size={28} className="text-gray-400" /></button>
                <div className="flex items-center space-x-2 text-duo-blue font-bold text-xl">
                    <Clock size={24} />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Production Écrite</h2>
            <div className="bg-gray-100 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-gray-700 uppercase text-sm mb-2">Sujet (B1/B2):</h3>
                <p className="text-lg whitespace-pre-line">{currentExercise.question}</p>
            </div>
            <textarea 
                className="w-full flex-1 border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-duo-blue outline-none resize-none min-h-[300px]"
                placeholder="Écrivez votre texte ici..."
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                disabled={checkStatus === 'analyzing' || checkStatus === 'correct'}
            />
            <div className="flex justify-between items-center mt-2 text-gray-500 font-bold text-sm">
                <span>Objectif: 160-180 mots</span>
                <span className={wordCount < 160 ? "text-orange-500" : "text-green-500"}>{wordCount} mots</span>
            </div>
            {feedback && (
                <div className="mt-6 bg-blue-50 border-2 border-blue-100 p-4 rounded-xl animate-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-duo-blue mb-2">Evaluation par l'IA:</h3>
                    <p className="whitespace-pre-line">{feedback}</p>
                </div>
            )}
            <div className="mt-8 flex justify-end">
                {checkStatus === 'none' ? (
                     <button onClick={handleSubmitWriting} disabled={wordCount < 5} className="bg-duo-green text-white px-8 py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all disabled:bg-gray-300 disabled:shadow-none">
                        Terminer
                    </button>
                ) : checkStatus === 'analyzing' ? (
                    <button disabled className="bg-gray-200 text-gray-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                        <Loader2 className="animate-spin" /> Analyse...
                    </button>
                ) : (
                    <button onClick={handleNext} className="bg-duo-green text-white px-8 py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_0_#46a302]">
                        Continuer
                    </button>
                )}
            </div>
        </div>
      );
  }

  // Speaking (Includes Pronunciation Practice)
  if (currentExercise.type === 'speaking') {
      return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6">
             <button onClick={onClose} className="absolute top-6 left-6"><X size={28} className="text-gray-400" /></button>
             <h2 className="text-3xl font-bold mb-8 text-center">Production Orale</h2>
             <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl mb-12 max-w-lg w-full text-center">
                 <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Consigne</h3>
                 <p className="text-xl font-medium text-gray-800 whitespace-pre-line">{currentExercise.question}</p>
                 <button onClick={() => playTTS(currentExercise.question.replace('Prononcez :', ''))} className="mt-4 text-duo-blue font-bold flex items-center justify-center gap-2 mx-auto"><Volume2 /> Écouter</button>
             </div>
             <div className="flex flex-col items-center space-y-6">
                {!isRecording && !audioBlob && (
                    <button onClick={startRecording} className="w-24 h-24 rounded-full bg-duo-blue flex items-center justify-center shadow-[0_4px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all">
                        <Mic size={40} className="text-white" />
                    </button>
                )}
                {isRecording && (
                    <div className="flex flex-col items-center">
                        <div className="animate-pulse text-red-500 font-bold mb-4">ENREGISTREMENT...</div>
                        <button onClick={stopRecording} className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-[0_4px_0_0_#cc0000] active:translate-y-1 active:shadow-none transition-all">
                            <Square size={32} className="text-white fill-white" />
                        </button>
                    </div>
                )}
                {audioBlob && checkStatus === 'none' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-green-600 font-bold">Audio capturé !</div>
                        <button onClick={() => { setAudioBlob(null); setIsRecording(false); }} className="text-gray-400 font-bold text-sm uppercase flex items-center gap-1 hover:text-gray-600">
                            <RefreshCcw size={16} /> Recommencer
                        </button>
                        <button onClick={handleSubmitSpeaking} className="bg-duo-green text-white px-12 py-4 rounded-xl font-bold uppercase shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all mt-4 text-xl">
                            Valider
                        </button>
                    </div>
                )}
                {checkStatus === 'analyzing' && (
                     <div className="flex items-center gap-2 text-xl font-bold text-gray-500">
                        <Loader2 className="animate-spin" /> Analyse...
                    </div>
                )}
             </div>
             {feedback && (
                <div className="mt-8 max-w-lg w-full bg-white border-2 border-gray-200 p-6 rounded-2xl animate-in slide-in-from-bottom-8 overflow-y-auto max-h-60">
                    <h3 className="font-bold text-gray-800 mb-2">Feedback:</h3>
                    <p className="whitespace-pre-line text-gray-600">{feedback}</p>
                    <button onClick={handleNext} className="w-full mt-4 bg-duo-blue text-white py-3 rounded-xl font-bold uppercase">Continuer</button>
                </div>
            )}
        </div>
      );
  }

  // Standard (Reading, Fill-Gap, Multiple Choice, etc.)
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      <div className="px-4 py-6 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={28} strokeWidth={2.5} /></button>
        <div className="flex-1 mx-4 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-duo-green transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center text-red-500 font-bold">
           <svg className="w-6 h-6 mr-1 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> {hearts}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className={`max-w-4xl mx-auto px-4 flex flex-col ${currentExercise.type === 'reading-comprehension' ? 'lg:flex-row lg:items-start lg:gap-8' : 'items-center'}`}>
            {currentExercise.type === 'reading-comprehension' && currentExercise.contextText && (
                <div className="lg:w-1/2 bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 mb-6 lg:mb-0 lg:sticky lg:top-4">
                    <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold uppercase text-sm">
                        <FileText size={18} />
                        <span>Dossier d'Enquête</span>
                    </div>
                    <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line font-serif">
                        {currentExercise.contextText}
                    </p>
                </div>
            )}
            <div className={`${currentExercise.type === 'reading-comprehension' ? 'lg:w-1/2' : 'w-full max-w-2xl'}`}>
                {/* Audio Player for Listening Comprehension */}
                {currentExercise.audioUrl && (
                    <div className="mb-6 w-full">
                         <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-xl flex flex-col items-center">
                             <div className="flex items-center gap-2 text-duo-blue font-bold uppercase text-sm mb-2">
                                <Volume2 size={18} />
                                <span>Document Audio</span>
                             </div>
                             <audio 
                                ref={audioRef}
                                controls 
                                className="w-full h-10 accent-duo-blue"
                                // crossOrigin="anonymous" removed to fix external audio loading
                             >
                                <source src={currentExercise.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                             </audio>
                         </div>
                    </div>
                )}
                
                {/* UNIT 1 LIPSYNC CHARACTER */}
                {unitNumber === 1 && (
                     <div className="flex justify-center -mt-4 mb-4">
                        <SpeakingCharacter 
                            imageSrc="https://i.postimg.cc/K8NSnBdy/Screenshot-2025-12-07-10-58-51-Photoroom.png" 
                            isSpeaking={isCharacterSpeaking} 
                            audioLevel={audioLevel}
                        />
                     </div>
                )}

                {/* GLOBAL CHARACTER IMAGE (Unit 6 Dog OR Unit 8 Dynamic) */}
                {/* Unit 6 specific check */}
                {unitNumber === 6 && (
                     <div className="flex justify-center -mt-4 mb-4">
                        <img 
                            src="https://i.postimg.cc/mPt54zLd/image.png" 
                            alt="Le Chien" 
                            className="w-32 h-32 object-contain drop-shadow-md animate-bounce-slight"
                        />
                     </div>
                )}
                {/* Generic exercise character image (Unit 8) */}
                {currentExercise.characterImage && unitNumber !== 6 && unitNumber !== 1 && (
                    <div className="flex justify-center -mt-4 mb-4">
                        <img 
                            src={currentExercise.characterImage} 
                            alt="Personnage" 
                            className="w-32 h-32 object-contain drop-shadow-md animate-bounce-slight"
                        />
                     </div>
                )}

                <h2 className="text-2xl font-extrabold text-gray-700 mb-8 leading-tight">
                    {currentExercise.question}
                </h2>
                
                {/* Specific UI for Fill-Gap with Options */}
                {currentExercise.type === 'fill-gap' && (
                    <div className="mb-8 p-4 bg-gray-100 rounded-xl text-center text-lg font-mono">
                        {currentExercise.question.split('____').map((part, i) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < currentExercise.question.split('____').length - 1 && (
                                    <span className="inline-block w-24 border-b-2 border-gray-400 mx-1 text-duo-blue font-bold">
                                        {selectedOption || '____'}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                  {currentExercise.options?.map((option, idx) => {
                     const isSelected = selectedOption === option;
                     let optionClass = "border-2 border-gray-200 hover:bg-gray-50";
                     if (isSelected) optionClass = "bg-blue-50 border-duo-blue text-duo-blue";
                     if (checkStatus === 'correct' && option === currentExercise.correctAnswer) optionClass = "bg-green-50 border-duo-green text-duo-green";
                     if (checkStatus === 'wrong' && isSelected) optionClass = "bg-red-50 border-duo-red text-duo-red";

                     return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={checkStatus !== 'none'}
                        className={`w-full p-4 rounded-xl text-lg font-medium text-left flex items-center space-x-3 transition-all ${optionClass} ${isSelected ? 'shadow-sm' : 'shadow-[0_2px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold ${isSelected ? 'border-current' : 'border-gray-200 text-gray-400'}`}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{option}</span>
                      </button>
                     );
                  })}
                </div>
            </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 w-full border-t-2 p-4 md:p-8 z-[70] transition-colors ${checkStatus === 'correct' ? 'bg-green-100 border-green-100' : checkStatus === 'wrong' ? 'bg-red-100 border-red-100' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            {checkStatus === 'correct' && <div className="flex items-center gap-3 text-green-700 font-bold text-xl"><div className="bg-white p-2 rounded-full"><Check /></div> <span>Correct!</span></div>}
            {checkStatus === 'wrong' && <div className="flex items-center gap-3 text-red-700 font-bold text-xl"><div className="bg-white p-2 rounded-full"><X /></div> <span>Solution: {currentExercise.correctAnswer}</span></div>}
            {checkStatus === 'none' && <div />}
            <button
                onClick={checkStatus === 'none' ? handleCheck : handleNext}
                disabled={!selectedOption && checkStatus === 'none'}
                className={`px-8 py-3 rounded-xl font-extrabold uppercase shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all min-w-[150px]
                    ${checkStatus === 'none' ? 'bg-duo-green text-white hover:bg-duo-green-dark disabled:bg-gray-200 disabled:text-gray-400' : ''}
                    ${checkStatus === 'correct' ? 'bg-duo-green text-white hover:bg-duo-green-dark' : ''}
                    ${checkStatus === 'wrong' ? 'bg-duo-red text-white hover:bg-red-600' : ''}
                `}
            >
                {checkStatus === 'none' ? 'Vérifier' : 'Continuer'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LessonOverlay;
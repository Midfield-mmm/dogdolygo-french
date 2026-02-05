import React, { useState, useRef, useEffect } from 'react';
import { CircleHelp, Send, X, Loader2, Bot, AlertCircle } from 'lucide-react';
import { askSupportBot } from '../services/geminiService';

interface SupportChatProps {
  visible: boolean;
}

const SupportChat: React.FC<SupportChatProps> = ({ visible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isError?: boolean }[]>([
    { role: 'bot', text: "Bonjour ! Je suis l'assistant DogDolyGO! Posez-moi une question sur l'application ou DogDokyGO!." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    try {
        const response = await askSupportBot(userMsg);
        setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'bot', text: "Erreur de connexion au service d'aide.", isError: true }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-[60] w-14 h-14 bg-duo-blue hover:bg-duo-blue-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white"
        aria-label="Aide"
      >
        {isOpen ? <X size={28} /> : <CircleHelp size={32} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 lg:bottom-24 lg:right-8 z-[60] w-80 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden flex flex-col h-[450px] animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-duo-blue p-4 flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Bot className="text-white" size={24} />
             </div>
             <div>
                <h3 className="text-white font-bold text-lg">Support DogDolyGO!</h3>
                <div className="flex items-center gap-1 text-blue-100 text-xs font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    En ligne (Gemini 2.5)
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="ml-auto text-white/80 hover:text-white">
                <X size={20} />
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-duo-blue text-white rounded-br-none' 
                        : msg.isError 
                            ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-none'
                            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                    }`}
                >
                    {msg.isError && <AlertCircle size={16} className="inline mr-2 mb-0.5" />}
                    {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                   <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                       <Loader2 className="animate-spin text-duo-blue" size={20} />
                       <span className="text-xs text-gray-400 font-bold">Recherche en cours...</span>
                   </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-duo-blue focus:outline-none text-sm transition-colors bg-gray-50 focus:bg-white"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-duo-blue hover:bg-blue-50 rounded-lg transition-colors disabled:text-gray-300 disabled:hover:bg-transparent"
                >
                    <Send size={20} />
                </button>
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                Source: <a href="https://attrape-sucrerie.my.canva.site/hfyryyryrfytyf" target="_blank" rel="noopener noreferrer" className="underline hover:text-duo-blue">Site Officiel</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
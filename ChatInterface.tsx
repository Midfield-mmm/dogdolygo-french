import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([
    { role: 'model', parts: [{ text: "Bonjour! Je suis ton professeur de français. On pratique ? (Hello! I'm your French tutor. Shall we practice?)" }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setIsLoading(true);

    const newHistory = [
      ...messages,
      { role: 'user' as const, parts: [{ text: userMsg }] }
    ];
    setMessages(newHistory);

    const responseText = await sendMessageToGemini(newHistory, userMsg);

    setMessages([
      ...newHistory,
      { role: 'model', parts: [{ text: responseText }] }
    ]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-screen lg:max-w-2xl mx-auto bg-white shadow-sm border-x border-gray-100">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center space-x-3">
        <div className="w-10 h-10 bg-duo-green rounded-full flex items-center justify-center">
             <Bot className="text-white" size={24} />
        </div>
        <div>
            <h2 className="text-xl font-extrabold text-gray-700">Duo Chat</h2>
            <p className="text-xs text-gray-500 font-bold uppercase">Powered by Gemini 2.5</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-duo-blue' : 'bg-duo-green'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-base ${
                msg.role === 'user' 
                  ? 'bg-blue-50 text-gray-800 rounded-br-none border-2 border-blue-100' 
                  : 'bg-white border-2 border-gray-200 text-gray-800 rounded-bl-none'
              }`}>
                {msg.parts[0].text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex flex-row items-end gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-duo-green">
                    <Bot size={16} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 rounded-bl-none">
                     <Loader2 className="animate-spin text-gray-400" size={20} />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white pb-24 lg:pb-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-duo-blue focus:outline-none placeholder-gray-400 text-gray-700 bg-gray-50 font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-duo-green hover:bg-green-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2 font-medium">AI can make mistakes. Check important info.</p>
      </div>
    </div>
  );
};

export default ChatInterface;
import React from 'react';
import { Home, Compass, Shield, Store, MoreHorizontal, MessageCircle, Bird } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'learn', icon: Home, label: 'Learn', color: 'text-duo-green' },
    { id: 'practice', icon: Compass, label: 'Practice' },
    { id: 'ai-tutor', icon: MessageCircle, label: 'AI Tutor' },
    { id: 'leaderboards', icon: Shield, label: 'Leaderboards' },
    { id: 'shop', icon: Store, label: 'Shop' },
    { id: 'profile', icon: Bird, label: 'Profile' },
    { id: 'more', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r-2 border-gray-200 bg-white px-4 py-6 z-50">
      <div className="mb-8 pl-4">
        <h1 className="text-3xl font-extrabold text-duo-green tracking-tight">DogDolyGO!</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-5 px-4 py-3 rounded-xl transition-colors duration-200 uppercase text-sm font-bold tracking-widest
                ${isActive 
                  ? 'bg-blue-50 text-duo-blue border-duo-blue' 
                  : 'text-gray-500 hover:bg-gray-100'
                }
                ${isActive ? 'border-2 border-blue-100' : 'border-2 border-transparent'}
              `}
            >
              <item.icon 
                size={28} 
                className={isActive ? 'text-duo-blue' : 'text-gray-400'} 
                strokeWidth={2.5}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
import React from 'react';
import { Home, Compass, Shield, Store, MessageCircle, Bird } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'learn', icon: Home },
    { id: 'ai-tutor', icon: MessageCircle },
    { id: 'leaderboards', icon: Shield },
    { id: 'shop', icon: Store },
    { id: 'profile', icon: Bird },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
           const isActive = activeTab === item.id;
           return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex justify-center items-center h-full"
            >
              <item.icon 
                size={28} 
                className={isActive ? 'text-duo-blue' : 'text-gray-400'} 
                strokeWidth={isActive ? 3 : 2.5}
              />
            </button>
           );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
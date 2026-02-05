import React from 'react';
import { BookOpen } from 'lucide-react';
import { Unit } from '../types';

interface UnitHeaderProps {
  unit: Unit;
  colorClass: string; // e.g., 'bg-duo-green'
}

const UnitHeader: React.FC<UnitHeaderProps> = ({ unit, colorClass }) => {
  // Unit 8 has a very light background, so we force dark text.
  // Others default to white text.
  const textColor = unit.number === 8 ? 'text-cyan-900' : 'text-white';
  const iconBg = unit.number === 8 ? 'bg-cyan-900 bg-opacity-10 hover:bg-opacity-20' : 'bg-black bg-opacity-10 hover:bg-opacity-20';

  return (
    <div className={`rounded-2xl p-4 mb-8 flex justify-between items-center ${colorClass} ${textColor}`}>
      <div>
        <h2 className="text-2xl font-extrabold mb-1">Unit {unit.number}</h2>
        <p className="font-medium text-lg opacity-90">{unit.title}</p>
        <p className="text-sm opacity-80 mt-1">{unit.description}</p>
      </div>
      <button className={`${iconBg} p-3 rounded-xl transition-all`}>
        <BookOpen size={24} strokeWidth={3} />
      </button>
    </div>
  );
};

export default UnitHeader;
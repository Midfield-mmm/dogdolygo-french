import React from 'react';
import { Star, Book, Trophy, Archive, Check } from 'lucide-react';
import { Lesson, LessonStatus } from '../types';

interface LessonNodeProps {
  lesson: Lesson;
  colorClass: string; // The active color e.g., 'bg-duo-green'
  onClick: () => void;
}

const LessonNode: React.FC<LessonNodeProps> = ({ lesson, colorClass, onClick }) => {
  const { status, type, isCurrent } = lesson;
  
  // Dynamic offset to simulate the snake path
  // Cycle: 0 -> -50 -> 0 -> 50 -> 0
  const getOffset = (index: number) => {
    const cycle = index % 8;
    switch (cycle) {
      case 0: return 'translate-x-0';
      case 1: return '-translate-x-12';
      case 2: return '-translate-x-16';
      case 3: return '-translate-x-12';
      case 4: return 'translate-x-0';
      case 5: return 'translate-x-12';
      case 6: return 'translate-x-16';
      case 7: return 'translate-x-12';
      default: return 'translate-x-0';
    }
  };

  const offsetClass = getOffset(lesson.index);

  const getIcon = () => {
    const size = 32;
    const stroke = 3.5;
    
    // If completed, we can show the icon or a checkmark. 
    // Duolingo keeps the icon but makes the node gold.
    if (type === 'trophy') return <Trophy size={size} strokeWidth={stroke} />;
    if (type === 'book') return <Book size={size} strokeWidth={stroke} />;
    if (type === 'chest') return <Archive size={size} strokeWidth={stroke} />;
    return <Star size={size} strokeWidth={stroke} />;
  };

  // Styles based on status
  let buttonClasses = `w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 z-10 relative `;
  let iconColor = 'text-white';
  
  if (status === LessonStatus.LOCKED) {
    buttonClasses += `bg-gray-200 border-b-4 border-gray-300 cursor-not-allowed`;
    iconColor = 'text-gray-300';
  } else if (status === LessonStatus.COMPLETED) {
    // GOLD STYLE FOR COMPLETED LESSONS
    buttonClasses += `bg-yellow-400 border-b-4 border-yellow-600 shadow-sm`;
    iconColor = 'text-yellow-100'; // Subtle contrast for the icon inside the gold circle
  } else if (status === LessonStatus.ACTIVE) {
    // Active Lesson (Available)
    buttonClasses += `${colorClass} border-b-4 border-opacity-40 border-black cursor-pointer shadow-lg`;
    
    // Only bounce if it is the "Current" (next logical) lesson
    if (isCurrent) {
        buttonClasses += ` animate-bounce-slight`;
    }
  }

  // Subtext floating (Show only for current lesson to avoid clutter, or completed)
  const showCrown = status === LessonStatus.COMPLETED || isCurrent;

  return (
    <div className={`flex flex-col items-center justify-center mb-6 relative ${offsetClass}`}>
      {/* Tooltip/Title only for the CURRENT lesson to reduce noise */}
      {lesson.title && isCurrent && (
        <div className="absolute -top-10 bg-white border-2 border-gray-200 px-3 py-1 rounded-xl text-gray-700 font-bold text-sm shadow-sm animate-bounce">
            {lesson.title}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-200 rotate-45"></div>
        </div>
      )}

      <button onClick={onClick} className={buttonClasses} disabled={status === LessonStatus.LOCKED}>
        <div className={iconColor}>
            {getIcon()}
        </div>
        
        {/* Shine effect for Active */}
        {status === LessonStatus.ACTIVE && (
            <div className="absolute top-1 right-1">
                <div className="w-3 h-3 bg-white rounded-full opacity-30"></div>
            </div>
        )}

        {/* Checkmark badge for Completed */}
        {status === LessonStatus.COMPLETED && (
            <div className="absolute bottom-0 right-0 bg-yellow-600 rounded-full p-1 border-2 border-white translate-x-1 translate-y-1">
                <Check size={12} className="text-white" strokeWidth={4} />
            </div>
        )}
      </button>
      
      {/* Crown progress ring mockup for active/completed */}
       {showCrown && type !== 'chest' && type !== 'book' && (
         <div className="mt-2 flex space-x-1">
            {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-2 h-1 rounded-full ${i < lesson.completedLevels ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
            ))}
         </div>
       )}
    </div>
  );
};

export default LessonNode;
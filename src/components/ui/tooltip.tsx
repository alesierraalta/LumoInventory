import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip = ({ 
  children, 
  content, 
  position = 'top' 
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  const arrowPositionClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-700 dark:border-t-slate-600',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-700 dark:border-r-slate-600',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700 dark:border-b-slate-600',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-700 dark:border-l-slate-600'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute ${positionClasses[position]} z-50 px-3 py-2 text-xs font-medium text-white bg-slate-700 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 whitespace-nowrap dark:bg-slate-600 dark:bg-opacity-95 transition-opacity duration-150 ease-in-out`}
        >
          {content}
          <div 
            className={`absolute ${arrowPositionClasses[position]} border-4 border-transparent z-40`}
          />
        </div>
      )}
    </div>
  );
}; 
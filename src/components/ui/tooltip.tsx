import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  contentClassName?: string;
  showArrow?: boolean;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
  contentClassName = '',
  showArrow = true,
  maxWidth = '250px',
}) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const childRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 100);
  };

  // Position classes
  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+8px)]',
    right: 'translate-y-[-50%] left-[calc(100%+8px)] top-1/2',
    bottom: '-translate-x-1/2 translate-y-0 left-1/2 top-[calc(100%+8px)]',
    left: 'translate-y-[-50%] right-[calc(100%+8px)] top-1/2',
  };
  
  // Arrow position classes
  const arrowClasses = {
    top: 'bottom-[-5px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    right: 'left-[-5px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    bottom: 'top-[-5px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-5px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (!mounted) return <>{children}</>;

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      ref={childRef}
    >
      {children}
      
      <AnimatePresence>
        {visible && content && (
          <motion.div
            className={`absolute z-50 ${positionClasses[position]}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div 
              className={`
                px-3 py-2 rounded-md bg-gray-800 text-white text-sm shadow-lg
                dark:bg-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95
                ${contentClassName}
              `}
              style={{ maxWidth }}
            >
              {content}
              {showArrow && (
                <div 
                  className={`
                    absolute w-0 h-0 border-solid border-[5px] 
                    border-gray-800 dark:border-gray-700
                    ${arrowClasses[position]}
                  `}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 
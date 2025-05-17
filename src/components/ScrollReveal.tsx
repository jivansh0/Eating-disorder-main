
import React, { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up'
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const getDirectionClass = () => {
    switch (direction) {
      case 'up': 
        return 'reveal-on-scroll-up';
      case 'down': 
        return 'reveal-on-scroll-down';
      case 'left': 
        return 'reveal-on-scroll-left';
      case 'right': 
        return 'reveal-on-scroll-right';
      default: 
        return 'reveal-on-scroll';
    }
  };

  return (
    <div ref={elementRef} className={`${getDirectionClass()} ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;

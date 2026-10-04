import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  hoverGlow = true, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
        hoverGlow ? 'hover:border-neon-cyan/20 hover:shadow-glass-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;

import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-brand-border text-brand-muted',
    success: 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30',
    warning: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-500 border border-red-500/30',
    neon: 'bg-brand-neon/20 text-brand-neon border border-brand-neon/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

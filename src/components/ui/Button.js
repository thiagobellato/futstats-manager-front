import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-brand-primary hover:bg-brand-primary/90 text-brand-dark font-bold',
    secondary: 'bg-brand-card hover:bg-brand-border text-white border border-brand-border',
    outline: 'bg-transparent border border-brand-primary text-brand-primary hover:bg-brand-primary/10',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-bold',
    ghost: 'bg-transparent hover:bg-brand-card text-brand-muted hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

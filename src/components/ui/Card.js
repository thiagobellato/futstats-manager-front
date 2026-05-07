import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerAction }) => {
  return (
    <div className={`bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-xl ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-brand-muted">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;

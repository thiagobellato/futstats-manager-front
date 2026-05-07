import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 border-b border-brand-border bg-brand-dark/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar atletas, clubes ou partidas..." 
            className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl border border-brand-border text-brand-muted hover:text-white hover:bg-brand-card transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border-2 border-brand-dark"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;

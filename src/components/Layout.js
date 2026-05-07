import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-primary selection:text-brand-dark">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>

        <footer className="py-6 px-8 border-t border-brand-border text-center text-brand-muted text-xs">
          © 2026 FutStats Manager - Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}

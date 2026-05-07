import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Shield, 
  BarChart2, 
  Settings, 
  PlusCircle,
  List,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { 
      name: 'Atletas', 
      icon: <Users className="w-5 h-5" />,
      submenu: [
        { name: 'Gerenciar', path: '/menu-atleta/gerenciar', icon: <List className="w-4 h-4" /> },
        { name: 'Cadastrar', path: '/menu-atleta/cadastrar', icon: <PlusCircle className="w-4 h-4" /> },
        { name: 'Estatísticas', path: '/menu-atleta/estatisticas', icon: <BarChart2 className="w-4 h-4" /> },
      ]
    },
    { 
      name: 'Clubes', 
      icon: <Shield className="w-5 h-5" />,
      submenu: [
        { name: 'Gerenciar', path: '/menu-clube/gerenciar', icon: <List className="w-4 h-4" /> },
        { name: 'Cadastrar', path: '/menu-clube/cadastrar', icon: <PlusCircle className="w-4 h-4" /> },
      ]
    },
    { name: 'Configurações', path: '/configuracoes', icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-brand-dark border-r border-brand-border h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-black text-brand-primary tracking-tighter flex items-center gap-2">
          FUT<span className="text-white">STATS</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.path ? (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-brand-primary text-brand-dark font-bold shadow-lg shadow-brand-primary/20'
                      : 'text-brand-muted hover:text-white hover:bg-brand-card'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-brand-muted uppercase tracking-wider mt-4">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      className={`flex items-center gap-3 px-8 py-2.5 rounded-lg transition-all ${
                        isActive(sub.path)
                          ? 'text-brand-primary font-bold'
                          : 'text-brand-muted hover:text-white hover:bg-brand-card'
                      }`}
                    >
                      {sub.icon}
                      <span className="text-sm">{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-brand-border">
        <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg bg-brand-card group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-brand-dark font-bold">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-none">Admin</span>
              <span className="text-xs text-brand-muted">Conectado</span>
            </div>
          </div>
          <button className="text-brand-muted group-hover:text-red-500 transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
  const [activePath, setActivePath] = useState(null);
  const navigate = useNavigate();

  const handleClick = (path) => {
    if (activePath === path) {
      setActivePath(null);
      navigate('/');
    } else {
      setActivePath(path);
      navigate(path);
    }
  };

  const fecharBarra = () => {
    setActivePath(null);
    navigate('/');
  };

  const getLinkClass = (path) => {
    return `block px-3 py-2 rounded hover:bg-primaryGreen ${activePath === path ? 'bg-primaryGreen' : ''
      }`;
  };

  return (
    <div className="flex min-h-screen text-white">
      <nav className="w-64 bg-purple-900 p-6 flex flex-col min-h-screen border-r-2 border-primaryGreen">
        <h2 className="text-2xl font-bold mb-8 border-b border-primaryGreen pb-4">
          FutStats Manager
        </h2>

        <div className="mb-8">
          <h3 className="text-primaryGreen font-semibold mb-4">Atletas</h3>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => handleClick('/menu-atleta/cadastrar')}
                className={getLinkClass('/menu-atleta/cadastrar')}
              >
                Cadastrar Atleta
              </button>
            </li>
            <li>
              <button
                onClick={() => handleClick('/menu-atleta/gerenciar')}
                className={getLinkClass('/menu-atleta/gerenciar')}
              >
                Gerenciar Atleta
              </button>
            </li>
            <li>
              <button
                onClick={() => handleClick('/menu-atleta/estatisticas')}
                className={getLinkClass('/menu-atleta/estatisticas')}
              >
                Estatísticas dos Atletas
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-primaryGreen font-semibold mb-4">Clubes</h3>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => handleClick('/menu-clube/cadastrar')}
                className={getLinkClass('/menu-clube/cadastrar')}
              >
                Cadastrar Clube
              </button>
            </li>
            <li>
              <button
                onClick={() => handleClick('/menu-clube/gerenciar')}
                className={getLinkClass('/menu-clube/gerenciar')}
              >
                Gerenciar Clube
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main className="flex-1 p-6 overflow-auto bg-gradient-to-r from-primaryPurple to-primaryGreen min-h-screen rounded-l-3xl shadow-lg">
        {/* Passa fecharBarra via contexto do Outlet */}
        <Outlet context={{ fecharBarra }} />
      </main>
    </div>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css';

export default function MenuClube() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/menu-clube/cadastrar", label: "Cadastro de Clubes" },
    { to: "/menu-clube/gerenciar", label: "Gerenciamento de Clubes" },
  ];

  const voltarAoMenu = () => {
    navigate('/');
  };

  return (
    <nav className="menu-lateral">
      <h2 className="menu-titulo">Menu Clube</h2>
      <ul className="menu-lista">
        {links.map(({ to, label }) => (
          <li
            key={to}
            className={location.pathname === to ? "menu-item ativo" : "menu-item"}
          >
            <Link to={to}>{label}</Link>
          </li>
        ))}
      </ul>

      {/* Botão fora da lista, com estilo claro */}
      <div className="voltar-container">
        <button className="botao-voltar" onClick={voltarAoMenu}>
          ⬅️ Voltar ao Menu Inicial
        </button>
      </div>
    </nav>
  );
}

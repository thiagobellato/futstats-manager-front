// src/components/atleta/MenuAtleta.js
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';

export default function MenuAtleta() {
  const navigate = useNavigate();

  const voltarParaMenuInicial = () => {
    navigate('/');
  };

  return (
    <nav className="menu-lateral">
      <h2 className="menu-titulo">Menu Atleta</h2>
      <ul className="menu-lista">
        <li className="menu-item"><Link to="/menu-atleta/cadastrar">Cadastro de Atletas</Link></li>
        <li className="menu-item"><Link to="/menu-atleta/gerenciar">Gerenciar Atletas</Link></li>
        <li className="menu-item">
          <Link to="/menu-atleta/estatisticas">Estatísticas dos Atletas</Link>
        </li>
      </ul>

      {/* Botão de voltar para o menu inicial */}
      <div className="voltar-container">
        <button className="botao-voltar" onClick={voltarParaMenuInicial}>
          ⬅️ Voltar ao Menu Inicial
        </button>
      </div>
    </nav>
  );
}

// src/components/MenuInicial.js
import { Link } from 'react-router-dom'
import '../App.css'

export default function MenuInicial() {
  return (
    <div className="menu-inicial-container">
      <h1 className="menu-titulo">Gerenciador FIFA</h1>
      <p className="menu-subtitulo">Escolha uma área para gerenciar:</p>

      <div className="botoes-container">
        <Link to="/menu-clube" className="botao-menu-inicial">
          Acessar Menu Clube
        </Link>
        <Link to="/menu-atleta" className="botao-menu-inicial">
          Acessar Menu Atleta
        </Link>
      </div>
    </div>
  )
}

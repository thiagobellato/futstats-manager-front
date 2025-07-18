// src/App.js
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'

import MenuInicial from './components/MenuInicial'
import MenuAtleta from './components/atleta/MenuAtleta'
import MenuClube from './components/clube/MenuClube'

import CadastroClube from './components/clube/CadastroClube'
import EditarClube from './components/clube/EditarClube'
import GerenciarClube from './components/clube/GerenciarClube'

import CadastroAtleta from './components/atleta/CadastroAtleta'
import EditarAtleta from './components/atleta/EditarAtleta'
import GerenciarAtleta from './components/atleta/GerenciarAtleta'
import EstatisticasAtletas from './components/atleta/EstatisticasAtletas'

import ContadorTanques from './components/ContadorTanques';


export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Menu inicial */}
          <Route path="/" element={<MenuInicial />} />
          <Route path="/menu-clube" element={<MenuClube />} />
          <Route path="/menu-atleta" element={<MenuAtleta />} />

          {/* Rotas de Clube */}
          <Route path="/menu-clube/cadastrar" element={<CadastroClube />} />
          <Route path="/menu-clube/gerenciar" element={<GerenciarClube />} />
          <Route path="/menu-clube/gerenciar/editar" element={<EditarClube />} />

          {/* Rotas de Atleta */}
          <Route path="/menu-atleta/cadastrar" element={<CadastroAtleta />} />
          <Route path="/menu-atleta/gerenciar" element={<GerenciarAtleta />} />
           <Route path="/menu-atleta/estatisticas" element={<EstatisticasAtletas />} />
          <Route path="/menu-atleta/gerenciar/editar" element={<EditarAtleta />} />

          <Route path="/contador-tanques" element={<ContadorTanques />} />

        </Routes>
      </div>
    </Router>
  )
}

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './styles/estilosVisuais.css';
import Layout from './components/Layout';

import MenuInicial from './components/MenuInicial';

import CadastroClube from './components/clube/CadastroClube';
import EditarClube from './components/clube/EditarClube';
import GerenciarClube from './components/clube/GerenciarClube';

import CadastroAtleta from './components/atleta/CadastroAtleta';
import EditarAtleta from './components/atleta/EditarAtleta';
import GerenciarAtleta from './components/atleta/GerenciarAtleta';
import EstatisticasAtletas from './components/atleta/EstatisticasAtletas';

import ContadorTanques from './components/ContadorTanques';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Layout com sidebar */}
          <Route path="/" element={<Layout />}>
            {/* Rota inicial com menu inicial */}
            <Route index element={<MenuInicial />} />

            {/* Rotas de clube */}
            <Route path="menu-clube/cadastrar" element={<CadastroClube />} />
            <Route path="menu-clube/gerenciar" element={<GerenciarClube />} />
            <Route path="menu-clube/gerenciar/editar" element={<EditarClube />} />

            {/* Rotas de atleta */}
            <Route path="menu-atleta/cadastrar" element={<CadastroAtleta />} />
            <Route path="menu-atleta/gerenciar" element={<GerenciarAtleta />} />
            <Route path="menu-atleta/gerenciar/editar" element={<EditarAtleta />} />
            <Route path="menu-atleta/estatisticas" element={<EstatisticasAtletas />} />

            {/* Outras rotas */}
            <Route path="contador-tanques" element={<ContadorTanques />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

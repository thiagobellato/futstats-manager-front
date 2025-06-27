// src/App.js
import { useState } from 'react'
import './App.css'

import CadastroClube from './components/CadastroClube'
import ListaClubes from './components/ListaClubes'
import DetalhesClube from './components/DetalhesClube'
import EditarClube from './components/EditarClube'
import DeletarClube from './components/DeletarClube'

export default function App() {
  const [abaAtual, setAbaAtual] = useState('cadastro')

  return (
    <div className="app-container">
      <div className="menu">
        <button onClick={() => setAbaAtual('cadastro')}>Cadastrar</button>
        <button onClick={() => setAbaAtual('listar')}>Listar</button>
        <button onClick={() => setAbaAtual('buscar')}>Buscar por ID</button>
        <button onClick={() => setAbaAtual('editar')}>Editar</button>
        <button onClick={() => setAbaAtual('deletar')}>Deletar</button>
      </div>

      <div className="aba-conteudo">
        {abaAtual === 'cadastro' && <CadastroClube />}
        {abaAtual === 'listar' && <ListaClubes />}
        {abaAtual === 'buscar' && <DetalhesClube />}
        {abaAtual === 'editar' && <EditarClube />}
        {abaAtual === 'deletar' && <DeletarClube />}
      </div>
    </div>
  )
}

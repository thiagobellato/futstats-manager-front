import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function GerenciarClube() {
  const [clubes, setClubes] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)
  const [filtroPais, setFiltroPais] = useState('')
  const [filtroNome, setFiltroNome] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    buscarClubes()
  }, [])

  const buscarClubes = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/clube')
      setClubes(resposta.data)
    } catch (err) {
      setMensagem('Erro ao buscar clubes.')
      setErro(true)
    }
  }

  const deletarClube = async (clube) => {
    const confirmacao = window.confirm(`Tem certeza que deseja deletar o clube "${clube.nome}"?`)
    if (!confirmacao) {
      setMensagem(`Operação cancelada para o clube "${clube.nome}".`)
      setErro(false)
      return
    }

    try {
      await axios.delete(`http://localhost:8080/api/clube/deletar/${clube.clubeId}`)
      setMensagem(`Clube "${clube.nome}" deletado com sucesso!`)
      setErro(false)
      buscarClubes()
    } catch (err) {
      setMensagem(`Erro ao deletar o clube "${clube.nome}".`)
      setErro(true)
    }
  }

  const irParaEditar = (id) => {
    navigate(`/menu-clube/gerenciar/editar?id=${id}`)
  }

  const paisesUnicos = [...new Set(clubes.map(c => c.pais))]

  const clubesFiltrados = clubes.filter(clube => {
    const atendePais = filtroPais ? clube.pais === filtroPais : true
    const atendeNome = filtroNome ? clube.nome.toLowerCase().startsWith(filtroNome.toLowerCase()) : true
    return atendePais && atendeNome
  })

  return (
    <div className="form-card">
      {/* Setinha azul circular para voltar */}
      <div
        className="botao-voltar-circular"
        onClick={() => navigate('/menu-clube')}
        title="Voltar para Menu Clube"
        style={{ cursor: 'pointer', marginBottom: '20px' }}
      >
        ←
      </div>

      <h2>Gerenciar Clubes</h2>

      {mensagem && (
        <div className={`mensagem ${erro ? 'erro' : 'sucesso'}`}>{mensagem}</div>
      )}

      {/* Filtros */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Filtrar por país:{' '}
          <select value={filtroPais} onChange={e => setFiltroPais(e.target.value)}>
            <option value="">Todos</option>
            {paisesUnicos.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: '1rem' }}>
          Filtrar por nome:{' '}
          <input
            type="text"
            placeholder="Início do nome"
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
          />
        </label>
      </div>

      <ul className="lista-clubes">
        {clubesFiltrados.length > 0 ? (
          clubesFiltrados.map((clube) => (
            <li key={clube.clubeId} className="item-clube">
              <span>{clube.nome} ({clube.sigla} - {clube.pais})</span>
              <div className="acoes">
                <button title="Editar" onClick={() => irParaEditar(clube.clubeId)}>✏️</button>
                <button title="Deletar" onClick={() => deletarClube(clube)}>🗑️</button>
              </div>
            </li>
          ))
        ) : (
          <li>Nenhum clube encontrado com esses filtros.</li>
        )}
      </ul>
    </div>
  )
}

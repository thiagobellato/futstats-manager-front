import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroAtletaEmLote() {
  const [nome, setNome] = useState('')
  const [clubeId, setClubeId] = useState('')
  const [clubes, setClubes] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)
  const [atletasParaCadastrar, setAtletasParaCadastrar] = useState([])

  const navigate = useNavigate()
  const voltarParaMenuAtleta = () => navigate('/menu-atleta')

  useEffect(() => {
    async function carregarClubes() {
      try {
        const resposta = await axios.get('http://localhost:8080/api/clube')
        setClubes(resposta.data)
      } catch (err) {
        console.error('Erro ao carregar clubes:', err)
      }
    }

    carregarClubes()
  }, [])

  const adicionarAtletaNaLista = (e) => {
    e.preventDefault()

    if (!nome) {
      setMensagem('O nome do atleta é obrigatório.')
      setErro(true)
      return
    }

    const clubeSelecionado = clubes.find(c => c.clubeId === parseInt(clubeId))

    const novoAtleta = {
      nome,
      clubeId: clubeId ? parseInt(clubeId) : null,
      clubeNome: clubeSelecionado?.nome || 'Sem Clube'
    }

    setAtletasParaCadastrar([...atletasParaCadastrar, novoAtleta])
    setNome('')
    setClubeId('')
    setMensagem('')
    setErro(false)
  }

  const cadastrarTodos = async () => {
    if (atletasParaCadastrar.length === 0) {
      setMensagem('Adicione pelo menos um atleta antes de cadastrar.')
      setErro(true)
      return
    }

    try {
      await axios.post('http://localhost:8080/api/atleta/adicionar-em-lote', atletasParaCadastrar)
      setMensagem('Todos os atletas foram cadastrados com sucesso!')
      setErro(false)
      setAtletasParaCadastrar([])

      setTimeout(() => navigate('/menu-atleta'), 1000) // redireciona após 1s
    } catch (err) {
      console.error(err)
      setMensagem('Erro ao cadastrar os atletas.')
      setErro(true)
    }
  }

  return (
    <div className="form-card">
      {/* Seta azul circular para voltar */}
      <div
        className="botao-voltar-circular"
        onClick={voltarParaMenuAtleta}
        title="Voltar para o menu do atleta"
        style={{ cursor: 'pointer', marginBottom: '20px' }}
      >
        ←
      </div>

      <h2>Cadastrar Atletas em Lote</h2>

      <form onSubmit={adicionarAtletaNaLista}>
        <input
          type="text"
          placeholder="Nome do Atleta"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <select
          value={clubeId}
          onChange={(e) => setClubeId(e.target.value)}
        >
          <option value="">-- Sem Clube --</option>
          {clubes.map(clube => (
            <option key={clube.clubeId} value={clube.clubeId}>
              {clube.nome}
            </option>
          ))}
        </select>

        <button type="submit">Adicionar à Lista</button>
      </form>

      {atletasParaCadastrar.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Atletas na fila para cadastro:</h4>
          <ul>
            {atletasParaCadastrar.map((atleta, index) => (
              <li key={index}>
                {atleta.nome} ({atleta.clubeNome})
              </li>
            ))}
          </ul>
          <button onClick={cadastrarTodos}>Cadastrar Todos</button>
        </div>
      )}

      {mensagem && (
        <div className={`mensagem ${erro ? 'erro' : 'sucesso'}`}>
          {mensagem}
        </div>
      )}
    </div>
  )
}

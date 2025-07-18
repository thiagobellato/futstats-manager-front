import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroClubeEmLote() {
  const [nome, setNome] = useState('')
  const [sigla, setSigla] = useState('')
  const [pais, setPais] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)
  const [clubesParaCadastrar, setClubesParaCadastrar] = useState([])

  const navigate = useNavigate()

  const adicionarClubeNaLista = (e) => {
    e.preventDefault()

    if (!nome || !sigla || !pais) {
      setMensagem('Preencha todos os campos antes de adicionar à lista.')
      setErro(true)
      return
    }

    const novoClube = {
      nome,
      sigla,
      pais
    }

    setClubesParaCadastrar([...clubesParaCadastrar, novoClube])
    setNome('')
    setSigla('')
    setPais('')
    setMensagem('')
    setErro(false)
  }

  const cadastrarTodos = async () => {
    if (clubesParaCadastrar.length === 0) {
      setMensagem('Adicione pelo menos um clube antes de cadastrar.')
      setErro(true)
      return
    }

    try {
      await axios.post('http://localhost:8080/api/clube/adicionar-em-lote', clubesParaCadastrar)
      setMensagem('Todos os clubes foram cadastrados com sucesso!')
      setErro(false)
      setClubesParaCadastrar([])

      // Volta para o menu do clube após o cadastro com sucesso
      setTimeout(() => {
        navigate('/menu-clube')
      }, 1200)

    } catch (err) {
      console.error(err)
      setMensagem('Erro ao cadastrar os clubes.')
      setErro(true)
    }
  }

  return (
    <div className="form-card">
      {/* Setinha para voltar ao menu anterior */}
      <div onClick={() => navigate('/menu-clube')} className="botao-voltar-circular" title="Voltar">
        ←
      </div>

      <h2>Cadastro de Clubes</h2>

      <form onSubmit={adicionarClubeNaLista}>
        <input
          type="text"
          placeholder="Nome do Clube"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Sigla"
          value={sigla}
          onChange={(e) => setSigla(e.target.value)}
        />
        <input
          type="text"
          placeholder="País"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
        />
        <button type="submit">Adicionar à Lista</button>
      </form>

      {clubesParaCadastrar.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Clubes na fila para cadastro:</h4>
          <ul>
            {clubesParaCadastrar.map((clube, index) => (
              <li key={index}>
                {clube.nome} ({clube.sigla}, {clube.pais})
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

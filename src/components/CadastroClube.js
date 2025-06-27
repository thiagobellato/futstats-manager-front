import { useState } from 'react'
import axios from 'axios'

export default function CadastroClube() {
  const [formData, setFormData] = useState({ nome: '', sigla: '', pais: '' })
  const [mensagem, setMensagem] = useState('')

  const BASE_URL = 'http://localhost:8080/api/clube'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${BASE_URL}/adicionar`, formData)
      setMensagem('✅ Clube cadastrado com sucesso!')
      setFormData({ nome: '', sigla: '', pais: '' })
    } catch (erro) {
      console.error('Erro ao cadastrar clube:', erro)
      setMensagem('❌ Erro ao cadastrar clube.')
    }
  }

  return (
    <div>
      <h2>Cadastro de Clube</h2>
      <form onSubmit={handleSubmit} className="form">
        <input name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required />
        <input name="sigla" placeholder="Sigla" value={formData.sigla} onChange={handleChange} required />
        <input name="pais" placeholder="País" value={formData.pais} onChange={handleChange} required />
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  )
}
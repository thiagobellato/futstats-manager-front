import { useState } from 'react'
import axios from 'axios'

export default function EditarClube() {
  const [id, setId] = useState('')
  const [formData, setFormData] = useState({ nome: '', sigla: '', pais: '' })
  const [mensagem, setMensagem] = useState('')

  const atualizarClube = async () => {
    try {
      await axios.put(`http://localhost:8080/api/clube/atualizar/${id}`, formData)
      setMensagem('✅ Clube atualizado!')
    } catch (err) {
      console.error('Erro:', err)
      setMensagem('❌ Erro ao atualizar clube.')
    }
  }

  return (
    <div>
      <h2>Editar Clube</h2>
      <input placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input name="nome" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
      <input name="sigla" placeholder="Sigla" value={formData.sigla} onChange={(e) => setFormData({...formData, sigla: e.target.value})} />
      <input name="pais" placeholder="País" value={formData.pais} onChange={(e) => setFormData({...formData, pais: e.target.value})} />
      <button onClick={atualizarClube}>Atualizar</button>
      {mensagem && <p>{mensagem}</p>}
    </div>
  )
}

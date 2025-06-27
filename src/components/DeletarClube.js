import { useState } from 'react'
import axios from 'axios'

export default function DeletarClube() {
  const [id, setId] = useState('')
  const [mensagem, setMensagem] = useState('')

  const deletarClube = async () => {
    if (!id) {
      setMensagem('⚠️ Informe um ID para deletar.')
      return
    }

    try {
      // Requisição limpa, sem headers desnecessários
      await axios({
        method: 'delete',
        url: `http://localhost:8080/api/clube/deletar/${id}`,
      })

      setMensagem(`✅ Clube com ID ${id} deletado com sucesso.`)
      setId('')
    } catch (err) {
      console.error('Erro ao deletar:', err)
      setMensagem('❌ Erro ao deletar clube. Verifique o console.')
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>🗑️ Deletar Clube</h2>
      <input
        type="number"
        placeholder="ID do clube"
        value={id}
        onChange={(e) => setId(e.target.value)}
        style={{
          padding: '0.5rem',
          marginRight: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />
      <button
        onClick={deletarClube}
        style={{
          backgroundColor: '#d9534f',
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Deletar
      </button>
      {mensagem && <p style={{ marginTop: '1rem' }}>{mensagem}</p>}
    </div>
  )
}

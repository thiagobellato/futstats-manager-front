import { useState } from 'react'
import axios from 'axios'

export default function DetalhesClube() {
  const [id, setId] = useState('')
  const [clube, setClube] = useState(null)

  const buscarPorId = () => {
    axios.get(`http://localhost:8080/api/clube/${id}`)
      .then(res => setClube(res.data))
      .catch(err => {
        setClube(null)
        console.error('Erro:', err)
      })
  }

  return (
    <div>
      <h2>Buscar Clube por ID</h2>
      <input placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={buscarPorId}>Buscar</button>
      {clube ? (
        <div className="clube-card">
          <p><strong>Nome:</strong> {clube.nome}</p>
          <p><strong>Sigla:</strong> {clube.sigla}</p>
          <p><strong>País:</strong> {clube.pais}</p>
        </div>
      ) : (
        <p>Nenhum clube encontrado.</p>
      )}
    </div>
  )
}
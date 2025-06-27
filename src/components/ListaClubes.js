import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ListaClubes() {
  const [clubes, setClubes] = useState([])

  useEffect(() => {
    axios.get('http://localhost:8080/api/clube')
      .then(res => setClubes(res.data))
      .catch(err => console.error('Erro ao buscar clubes:', err))
  }, [])

  return (
    <div>
      <h2>Lista de Clubes</h2>
      <ul className="lista-clubes">
        {clubes.map(clube => (
          <li key={clube.clubeId} className="clube-card">
            <strong>{clube.nome}</strong> - {clube.sigla} - {clube.pais}
          </li>
        ))}
      </ul>
    </div>
  )
}
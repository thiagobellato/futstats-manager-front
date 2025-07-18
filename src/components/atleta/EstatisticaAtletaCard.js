import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EstatisticasAtletaCard({ atletaId, onClose }) {
  const [estatistica, setEstatistica] = useState(null);

  useEffect(() => {
    axios.get(`/api/estatisticas/atleta/${atletaId}`)
      .then(response => setEstatistica(response.data))
      .catch(err => console.error(err));
  }, [atletaId]);

  const handleChange = (campo, valor) => {
    setEstatistica(prev => ({ ...prev, [campo]: valor }));
  };

  const handleIncrement = (campo, delta) => {
    setEstatistica(prev => ({ ...prev, [campo]: Math.max(0, prev[campo] + delta) }));
  };

  const salvarEstatistica = () => {
    axios.put(`/api/estatisticas/${estatistica.id}`, estatistica)
      .then(() => alert('Estatística atualizada!'))
      .catch(err => console.error(err));
  };

  if (!estatistica) return <div>Carregando...</div>;

  return (
    <div className="card-estatisticas">
      <div>
        <strong>Gols:</strong>
        <button onClick={() => handleIncrement('gols', -1)}>-</button>
        <input
          type="number"
          value={estatistica.gols}
          onChange={e => handleChange('gols', parseInt(e.target.value))}
        />
        <button onClick={() => handleIncrement('gols', 1)}>+</button>
      </div>
      <div>
        <strong>Assistências:</strong>
        <button onClick={() => handleIncrement('assistencias', -1)}>-</button>
        <input
          type="number"
          value={estatistica.assistencias}
          onChange={e => handleChange('assistencias', parseInt(e.target.value))}
        />
        <button onClick={() => handleIncrement('assistencias', 1)}>+</button>
      </div>
      <button onClick={salvarEstatistica}>Salvar</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
}

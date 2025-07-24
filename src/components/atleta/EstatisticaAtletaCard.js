import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EstatisticasAtletaCard({ atletaId, onClose }) {
  const [estatistica, setEstatistica] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/estatisticas/atleta/${atletaId}`)
      .then(response => {
        setEstatistica(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [atletaId]);

  const atualizarCampo = (campo, novoValor) => {
    const novaEstatistica = { ...estatistica, [campo]: novoValor };

    setEstatistica(novaEstatistica);

    // Atualiza no backend imediatamente
    axios.put(`/api/estatisticas/${novaEstatistica.id}`, novaEstatistica)
      .then(() => {
        console.log(`Campo ${campo} atualizado para ${novoValor}`);
      })
      .catch(err => console.error(err));
  };

  const handleIncrement = (campo, delta) => {
    const valorAtual = estatistica[campo] || 0;
    const novoValor = Math.max(0, valorAtual + delta);
    atualizarCampo(campo, novoValor);
  };

  if (loading) return <div>Carregando...</div>;
  if (!estatistica) return <div>Estatística não encontrada</div>;

  return (
    <div className="card-estatisticas">
      <div>
        <strong>Gols:</strong>
        <button onClick={() => handleIncrement('gols', -1)}>-</button>
        <input
          type="number"
          value={estatistica.gols}
          onChange={e => atualizarCampo('gols', parseInt(e.target.value) || 0)}
        />
        <button onClick={() => handleIncrement('gols', 1)}>+</button>
      </div>
      <div>
        <strong>Assistências:</strong>
        <button onClick={() => handleIncrement('assistencias', -1)}>-</button>
        <input
          type="number"
          value={estatistica.assistencias}
          onChange={e => atualizarCampo('assistencias', parseInt(e.target.value) || 0)}
        />
        <button onClick={() => handleIncrement('assistencias', 1)}>+</button>
      </div>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
}

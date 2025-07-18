import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EstatisticasAtletas() {
  const [estatisticas, setEstatisticas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('nome');

  const navigate = useNavigate();

  useEffect(() => {
    buscarEstatisticas();
  }, []);

  const buscarEstatisticas = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/estatistica');
      setEstatisticas(resposta.data);
    } catch (err) {
      setMensagem('Erro ao buscar estatísticas.');
      setErro(true);
    }
  };

  // Agrupar estatísticas por nome do atleta (somar gols/assistências)
  const estatisticasPorAtleta = estatisticas.reduce((acc, stat) => {
    const nome = stat.nomeAtleta;
    if (!acc[nome]) {
      acc[nome] = { nome: stat.nomeAtleta, gols: 0, assistencias: 0 };
    }
    acc[nome].gols += stat.gols;
    acc[nome].assistencias += stat.assistencias;
    return acc;
  }, {});

  const rankingGols = Object.values(estatisticasPorAtleta)
    .sort((a, b) => b.gols - a.gols)
    .slice(0, 3);

  const rankingAssistencias = Object.values(estatisticasPorAtleta)
    .sort((a, b) => b.assistencias - a.assistencias)
    .slice(0, 3);

  // Ordenação visual
  const estatisticasOrdenadas = [...estatisticas].sort((a, b) => {
    if (ordenarPor === 'nome') return a.nomeAtleta.localeCompare(b.nomeAtleta);
    if (ordenarPor === 'gols') return b.gols - a.gols;
    if (ordenarPor === 'assistencias') return b.assistencias - a.assistencias;
    return 0;
  });

  return (
    <div className="form-card">
      <div
        className="botao-voltar-circular"
        onClick={() => navigate('/menu-atleta')}
        title="Voltar para o menu"
      >
        ←
      </div>

      <h2>📊 Estatísticas dos Atletas</h2>

      {mensagem && (
        <div className={`mensagem ${erro ? 'erro' : 'sucesso'}`}>{mensagem}</div>
      )}

      {/* Filtros de ordenação */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <label>
          Ordenar por:&nbsp;
          <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
            <option value="nome">Nome</option>
            <option value="gols">Gols</option>
            <option value="assistencias">Assistências</option>
          </select>
        </label>
      </div>

      {/* Lista de estatísticas */}
      <ul className="lista-clubes">
        {estatisticasOrdenadas.length > 0 ? (
          estatisticasOrdenadas.map((e, index) => (
            <li key={index} className="item-clube">
              <strong>{e.nomeAtleta}</strong> — Clube: <strong>{e.nomeClube}</strong> |{' '}
              Gols: <strong>{e.gols}</strong> |{' '}
              Assistências: <strong>{e.assistencias}</strong>
            </li>
          ))
        ) : (
          <li>Nenhuma estatística encontrada.</li>
        )}
      </ul>

      {/* Ranking lateral */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <div>
          <h3>🏆 Top 3 Goleadores</h3>
          <ol>
            {rankingGols.map((a, i) => (
              <li key={i}>
                <strong>{a.nome}</strong> — {a.gols} gols
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3>🎯 Top 3 Assistentes</h3>
          <ol>
            {rankingAssistencias.map((a, i) => (
              <li key={i}>
                <strong>{a.nome}</strong> — {a.assistencias} assistências
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

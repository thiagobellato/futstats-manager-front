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
      acc[nome] = { nome: stat.nomeAtleta, gols: 0, assistencias: 0, clube: stat.nomeClube };
    }
    acc[nome].gols += stat.gols;
    acc[nome].assistencias += stat.assistencias;
    return acc;
  }, {});

  // Array para ordenar e exibir
  const atletasArray = Object.values(estatisticasPorAtleta);

  // Ordenação conforme filtro selecionado
  const atletasOrdenados = atletasArray.sort((a, b) => {
    if (ordenarPor === 'nome') {
      return a.nome.localeCompare(b.nome);
    } else if (ordenarPor === 'gols') {
      return b.gols - a.gols;
    } else if (ordenarPor === 'assistencias') {
      return b.assistencias - a.assistencias;
    }
    return 0;
  });

  // Ranking top 3 goleadores e assistentes (uso slice para não alterar o original)
  const rankingGols = atletasArray
    .slice()
    .sort((a, b) => b.gols - a.gols)
    .slice(0, 3);

  const rankingAssistencias = atletasArray
    .slice()
    .sort((a, b) => b.assistencias - a.assistencias)
    .slice(0, 3);

  return (
    <div className="form-card estatisticas-atletas-container">
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
      <div className="filtros-estatisticas">
        <label>
          Ordenar por:&nbsp;
          <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
            <option value="nome">Nome</option>
            <option value="gols">Gols</option>
            <option value="assistencias">Assistências</option>
          </select>
        </label>
      </div>

      {/* Lista de estatísticas com espaçamento horizontal */}
      <ul className="lista-estatisticas">
        {atletasOrdenados.length > 0 ? (
          atletasOrdenados.map((e, index) => (
            <li key={index} className="item-estatistica">
              <span><strong>Nome:</strong> {e.nome}</span>
              <span><strong>Clube:</strong> {e.clube}</span>
              <span><strong>Gols:</strong> {e.gols}</span>
              <span><strong>Assistências:</strong> {e.assistencias}</span>
            </li>
          ))
        ) : (
          <li>Nenhuma estatística encontrada.</li>
        )}
      </ul>

      {/* Ranking organizado horizontalmente */}
      <div className="ranking-container">
        <div className="ranking-box">
          <h3>🏆 Top 3 Goleadores</h3>
          <ol>
            {rankingGols.map((a, i) => (
              <li key={i}>
                <strong>{a.nome}</strong> — {a.gols} gol{a.gols !== 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        </div>

        <div className="ranking-box">
          <h3>🎯 Top 3 Assistentes</h3>
          <ol>
            {rankingAssistencias.map((a, i) => (
              <li key={i}>
                <strong>{a.nome}</strong> — {a.assistencias} assistência{a.assistencias !== 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

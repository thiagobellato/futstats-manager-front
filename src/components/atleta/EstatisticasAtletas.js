import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EstatisticasAtletas() {
  const [estatisticas, setEstatisticas] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('nome');
  const [expandedAtleta, setExpandedAtleta] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    try {
      const [resEstatisticas, resAtletas] = await Promise.all([
        axios.get('http://localhost:8080/api/estatistica'),
        axios.get('http://localhost:8080/api/atleta'),
      ]);
      setEstatisticas(resEstatisticas.data);
      setAtletas(resAtletas.data);
    } catch (err) {
      setMensagem('Erro ao buscar dados.');
      setErro(true);
    }
  };

  // Mapa para clube atual por chave combinada atletaId + nomeAtleta
  const clubeAtualPorId = atletas.reduce((acc, atleta) => {
    const chave = `${atleta.atletaId}-${atleta.nome}`; // <-- Aqui a correção para atletaId
    acc[chave] = atleta.clubeNome || 'Sem clube atual'; // Mantendo o que você já tinha para o clube
    return acc;
  }, {});

  // Agrupa estatísticas por atletaId + nomeAtleta para evitar misturar atletas com nomes iguais
  const estatisticasPorAtleta = estatisticas.reduce((acc, stat) => {
    const chave = `${stat.atletaId}-${stat.nomeAtleta}`; // Usa atletaId do backend

    if (!acc[chave]) {
      acc[chave] = {
        id: stat.atletaId,
        nome: stat.nomeAtleta,
        gols: 0,
        assistencias: 0,
        clube: clubeAtualPorId[chave] || stat.nomeClube || 'Sem clube',
        historico: [],
      };
    }

    acc[chave].gols += stat.gols || 0;
    acc[chave].assistencias += stat.assistencias || 0;

    acc[chave].historico.push({
      clube: stat.nomeClube,
      gols: stat.gols || 0,
      assistencias: stat.assistencias || 0,
    });

    return acc;
  }, {});

  const atletasArray = Object.values(estatisticasPorAtleta);

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

  const rankingGols = atletasArray
    .slice()
    .sort((a, b) => b.gols - a.gols)
    .slice(0, 3);

  const rankingAssistencias = atletasArray
    .slice()
    .sort((a, b) => b.assistencias - a.assistencias)
    .slice(0, 3);

  const toggleExpandir = (chave) => {
    setExpandedAtleta(expandedAtleta === chave ? null : chave);
  };

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

      <ul className="lista-estatisticas">
        {atletasOrdenados.length > 0 ? (
          atletasOrdenados.map((e) => {
            const chave = `${e.id}-${e.nome}`;
            return (
              <li
                key={chave}
                className="item-estatistica"
                onClick={() => toggleExpandir(chave)}
                style={{ cursor: 'pointer' }}
              >
                <span><strong>Nome:</strong> {e.nome}</span>
                <span><strong>Clube Atual:</strong> {e.clube}</span>
                <span><strong>Gols:</strong> {e.gols}</span>
                <span><strong>Assistências:</strong> {e.assistencias}</span>

                {expandedAtleta === chave && (
                  <div className="historico-clubes">
                    <h4>📂 Histórico por clube:</h4>
                    <ul>
                      {e.historico.map((h, i) => (
                        <li key={i}>
                          <strong>{h.clube}</strong> — {h.gols} gol{h.gols !== 1 ? 's' : ''}, {h.assistencias} assistência{h.assistencias !== 1 ? 's' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li>Nenhuma estatística encontrada.</li>
        )}
      </ul>

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

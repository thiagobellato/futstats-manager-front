import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaFutbol, FaRunning } from 'react-icons/fa';
import BotaoVoltar from '../BotaoVoltar';

export default function EstatisticasAtletas() {
  const [estatisticas, setEstatisticas] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('nome');
  const [expandedAtleta, setExpandedAtleta] = useState(null);
  const { fecharBarra } = useOutletContext();

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

  const handleVoltar = () => {
    fecharBarra(null);
    navigate('/');
  };

  // Mapa para clube atual por chave combinada atletaId + nomeAtleta
  const clubeAtualPorId = atletas.reduce((acc, atleta) => {
    const chave = `${atleta.atletaId}-${atleta.nome}`;
    acc[chave] = atleta.clubeNome || 'Sem clube atual';
    return acc;
  }, {});

  // Agrupa estatísticas por atletaId + nomeAtleta para evitar confusão com nomes iguais
  // Mantém o histórico na ordem original do backend (sem ordenar)
  const estatisticasPorAtleta = estatisticas.reduce((acc, stat) => {
    const chave = `${stat.atletaId}-${stat.nomeAtleta}`;

    if (!acc[chave]) {
      acc[chave] = {
        id: stat.atletaId,
        nome: stat.nomeAtleta,
        gols: 0,
        assistencias: 0,
        cartaoAmarelo: 0,
        cartaoVermelho: 0,
        clube: clubeAtualPorId[chave] || stat.nomeClube || 'Sem clube',
        historico: [],
      };
    }

    acc[chave].gols += stat.gols || 0;
    acc[chave].assistencias += stat.assistencias || 0;
    acc[chave].cartaoAmarelo += stat.cartaoAmarelo || 0;
    acc[chave].cartaoVermelho += stat.cartaoVermelho || 0;

    acc[chave].historico.push({
      clube: stat.nomeClube,
      gols: stat.gols || 0,
      assistencias: stat.assistencias || 0,
      cartaoAmarelo: stat.cartaoAmarelo || 0,
      cartaoVermelho: stat.cartaoVermelho || 0,
      dataInicio: stat.dataInicio, // só para referência futura
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

      <div className="flex items-center mb-6">
        
      <BotaoVoltar onClick={handleVoltar} />

      <h2 className="form-title">
        Estatísticas dos Atletas
      </h2>
      </div>

      {mensagem && (
        <div className={`mensagem ${erro ? 'erro' : 'sucesso'} mb-6`}>
          {mensagem}
        </div>
      )}

      <div className="mb-6">
        <label className="text-white font-semibold">
          Ordenar por:&nbsp;
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="filtro-select"
          >
            <option value="nome">Nome</option>
            <option value="gols">Gols</option>
            <option value="assistencias">Assistências</option>
          </select>
        </label>
      </div>

      <ul className="space-y-4">
        {atletasOrdenados.length > 0 ? (
          atletasOrdenados.map((e) => {
            const chave = `${e.id}-${e.nome}`;
            return (
              <li
                key={chave}
                className="bg-primaryPurple rounded-lg p-4 shadow-md cursor-pointer"
                onClick={() => toggleExpandir(chave)}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') toggleExpandir(chave);
                }}
              >
                <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr] gap-4 items-center">
                  <span
                    className="text-white font-semibold truncate"
                    title={e.nome}
                  >
                    {e.nome}
                  </span>

                  <span
                    className="text-white truncate"
                    title={e.clube}
                  >
                    <strong>Clube Atual: </strong> {e.clube}
                  </span>

                  <span className="flex items-center gap-1 text-white font-semibold justify-center">
                    <FaFutbol className="text-green-400" />
                    {e.gols}
                  </span>

                  <span className="flex items-center gap-1 text-white font-semibold justify-center">
                    <FaRunning className="text-green-400" />
                    {e.assistencias}

                    <span className="ml-4 text-yellow-300 font-normal">
                      {e.cartaoAmarelo} <span title="Cartões Amarelos">🟨</span>
                    </span>
                    <span className="ml-2 text-red-500 font-normal">
                      {e.cartaoVermelho} <span title="Cartões Vermelhos">🟥</span>
                    </span>
                  </span>
                </div>

                {expandedAtleta === chave && (
                  <div className="mt-4 bg-primaryGreen bg-opacity-20 rounded-md p-3 text-white max-h-56 overflow-y-auto">
                    <h4 className="font-semibold mb-2">Histórico por clube:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {e.historico.map((h, i) => (
                        <li
                          key={i}
                          className="truncate"
                          title={`${h.clube}: ${h.gols} gols, ${h.assistencias} assistências`}
                        >
                          <strong>{h.clube}</strong> — {h.gols} gol
                          {h.gols !== 1 ? 's' : ''}, {h.assistencias} assistência
                          {h.assistencias !== 1 ? 's' : ''}
                          {h.cartaoAmarelo ? `, ${h.cartaoAmarelo} 🟨` : ''
                          }{h.cartaoVermelho ? `, ${h.cartaoVermelho} 🟥` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li className="text-white">Nenhuma estatística encontrada.</li>
        )}
      </ul>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-primaryPurple rounded-lg p-4 shadow-md">
          <h3 className="text-white font-bold mb-4 text-center">
            Top 3 Goleadores
          </h3>
          <ol className="list-decimal list-inside text-white space-y-1">
            {rankingGols.map((a, i) => (
              <li
                key={i}
                className="truncate"
                title={`${a.nome}: ${a.gols} gol${a.gols !== 1 ? 's' : ''}`}
              >
                <strong>{a.nome}</strong> — {a.gols} gol{a.gols !== 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-primaryPurple rounded-lg p-4 shadow-md">
          <h3 className="text-white font-bold mb-4 text-center">
            Top 3 Assistentes
          </h3>
          <ol className="list-decimal list-inside text-white space-y-1">
            {rankingAssistencias.map((a, i) => (
              <li
                key={i}
                className="truncate"
                title={`${a.nome}: ${a.assistencias} assistência${a.assistencias !== 1 ? 's' : ''
                  }`}
              >
                <strong>{a.nome}</strong> — {a.assistencias} assistência
                {a.assistencias !== 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

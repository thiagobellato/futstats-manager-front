import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import TransferirAtletaPanel from './TransferirAtletaPanel';
import { FiEdit2, FiTrash2, FiBarChart2, FiRepeat } from 'react-icons/fi';
import { AiOutlineSortAscending, AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { GiPuzzle } from 'react-icons/gi';
import BotaoVoltar from '../BotaoVoltar';

export default function GerenciarAtleta() {
  const { fecharBarra } = useOutletContext();
  const [atletas, setAtletas] = useState([]);
  const [posicoes, setPosicoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [estatisticaAberta, setEstatisticaAberta] = useState(null);
  const [dadosEstatistica, setDadosEstatistica] = useState({});
  const [ordenarAsc, setOrdenarAsc] = useState(true);
  const [ordenarPorPosicao, setOrdenarPorPosicao] = useState(false);
  const [ordenarPosicaoAsc, setOrdenarPosicaoAsc] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroNacionalidade, setFiltroNacionalidade] = useState('');
  const [filtroPosicao, setFiltroPosicao] = useState('');
  const [filtroClube, setFiltroClube] = useState('');
  const [atletaParaTransferirId, setAtletaParaTransferirId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    buscarAtletas();
    buscarPosicoes();
  }, []);

  const buscarAtletas = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/atleta');
      setAtletas(resposta.data);
    } catch (err) {
      setMensagem('Erro ao buscar atletas.');
      setErro(true);
    }
  };

  const buscarPosicoes = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/enums/posicoes');
      setPosicoes(resposta.data);
    } catch (err) {
      console.error('Erro ao buscar posições:', err);
    }
  };

  const deletarAtleta = async (atleta) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja deletar o atleta "${atleta.nome} ${atleta.sobrenome}"?`
    );
    if (!confirmacao) {
      setMensagem(`Operação cancelada para "${atleta.nome}".`);
      setErro(false);
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/atleta/deletar/${atleta.atletaId}`);
      setMensagem(`Atleta "${atleta.nome}" deletado com sucesso!`);
      setErro(false);
      buscarAtletas();
    } catch (err) {
      setMensagem(`Erro ao deletar o atleta "${atleta.nome}".`);
      setErro(true);
    }
  };

  const irParaEditar = (id) => {
    navigate(`/menu-atleta/gerenciar/editar?id=${id}`);
  };

  const atletaIncompleto = (atleta) => {
    return !atleta.posicao || !atleta.clubeNome || atleta.clubeNome === 'Sem Clube';
  };

  const toggleEstatisticas = (atleta) => {
    const atletaId = atleta.atletaId;
    const clubeId = atleta.clube?.clubeId ?? atleta.clubeId;

    // Fecha painel de transferência ao abrir estatísticas
    setAtletaParaTransferirId(null);

    if (estatisticaAberta === atletaId) {
      setEstatisticaAberta(null);
      return;
    }

    axios
      .get(`http://localhost:8080/api/estatistica/${atletaId}/${clubeId}`)
      .then((res) => {
        const estat = res.data;
        if (!estat) {
          setMensagem('Nenhuma estatística encontrada para esse atleta.');
          setErro(false);
          setEstatisticaAberta(null);
          return;
        }

        setDadosEstatistica((prev) => ({
          ...prev,
          [atletaId]: {
            gols: estat.gols ?? 0,
            assistencias: estat.assistencias ?? 0,
          },
        }));

        setMensagem('Estatísticas carregadas com sucesso.');
        setErro(false);
        setEstatisticaAberta(atletaId);
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.data === '') {
          setMensagem('Nenhuma estatística encontrada para esse atleta.');
          setErro(false);
          setEstatisticaAberta(null);
        } else {
          const msgErro = err.response?.data?.message || err.message || 'Erro desconhecido';
          setMensagem(`Erro ao carregar estatísticas do atleta: ${msgErro}`);
          setErro(true);
          setEstatisticaAberta(null);
        }
      });
  };

  const handleIncrementarEstatistica = (atletaId, campo, delta) => {
    const valorAtual = dadosEstatistica[atletaId]?.[campo] ?? 0;
    const novoValor = Math.max(0, valorAtual + delta);

    const novosDados = {
      ...dadosEstatistica,
      [atletaId]: {
        ...dadosEstatistica[atletaId],
        [campo]: novoValor,
      },
    };

    setDadosEstatistica(novosDados);

    salvarEstatisticasComValores(atletaId, novosDados[atletaId]);
  };

  const salvarEstatisticasComValores = async (atletaId, valores) => {
    const atleta = atletas.find((a) => a.atletaId === atletaId);
    const clubeId = atleta?.clube?.clubeId ?? atleta?.clubeId;

    if (!clubeId) {
      setMensagem('Esse atleta não está vinculado a nenhum clube.');
      setErro(true);
      return;
    }

    const dadosParaEnviar = {
      atletaId,
      clubeId,
      gols: valores?.gols ?? 0,
      assistencias: valores?.assistencias ?? 0,
    };

    try {
      await axios.put('http://localhost:8080/api/estatistica/atualizar', dadosParaEnviar, {
        headers: { 'Content-Type': 'application/json' },
      });
      setMensagem('Estatísticas atualizadas com sucesso.');
      setErro(false);
    } catch (err) {
      const msgErroBackend = err.response?.data?.message || err.message || 'Erro desconhecido';
      setMensagem(`Erro ao atualizar estatísticas: ${msgErroBackend}`);
      setErro(true);
    }
  };

  const toggleTransferirPanel = (atletaId) => {
    // Fecha painel de estatística ao abrir transferência
    setEstatisticaAberta(null);

    if (atletaParaTransferirId === atletaId) {
      setAtletaParaTransferirId(null);
    } else {
      setAtletaParaTransferirId(atletaId);
    }
  };

  const fecharTransferirPanel = () => setAtletaParaTransferirId(null);

  const nacionalidadesUnicas = [...new Set(atletas.map((a) => a.nacionalidade))];
  const clubesUnicos = [...new Set(atletas.map((a) => a.clubeNome))];

  let atletasFiltrados = atletas.filter((a) => {
    const buscaNome = filtroNome
      ? (a.nome ?? '').toLowerCase().startsWith(filtroNome.toLowerCase()) ||
      (a.sobrenome ?? '').toLowerCase().startsWith(filtroNome.toLowerCase())
      : true;

    const buscaNacionalidade = filtroNacionalidade ? a.nacionalidade === filtroNacionalidade : true;
    const buscaPosicao = filtroPosicao ? a.posicao === filtroPosicao : true;
    const buscaClube = filtroClube ? a.clubeNome === filtroClube : true;
    return buscaNome && buscaNacionalidade && buscaPosicao && buscaClube;
  });

  if (ordenarPorPosicao) {
    const ordemEnum = posicoes.map((p) => p.sigla);
    atletasFiltrados = [...atletasFiltrados].sort((a, b) => {
      const indexA = ordemEnum.indexOf(a.posicao);
      const indexB = ordemEnum.indexOf(b.posicao);
      return ordenarPosicaoAsc ? indexA - indexB : indexB - indexA;
    });
  } else {
    atletasFiltrados = [...atletasFiltrados].sort((a, b) => {
      const nomeA = `${a.nome ?? ''} ${a.sobrenome ?? ''}`.toLowerCase().trim();
      const nomeB = `${b.nome ?? ''} ${b.sobrenome ?? ''}`.toLowerCase().trim();
      return ordenarAsc ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
    });
  }

  const handleVoltar = () => {
    fecharBarra(null);
    navigate('/');
  };

  return (
    <div className="form-background">
      <div className="form-card max-w-[650px] p-4 mx-auto">

        <div className="flex items-center mb-6">
          <BotaoVoltar onClick={handleVoltar} />
          <h2 className="form-title">Gerenciar Atletas</h2>
        </div>


        {mensagem && (
          <div
            className={`mensagem ${erro ? 'erro' : 'sucesso'}`}
            style={{
              marginBottom: 12,
              textAlign: 'center',
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.875rem',
              lineHeight: 1.2,
              padding: '0.25rem 0.5rem',
              borderRadius: 6,
            }}
            title={mensagem}
          >
            {mensagem}
          </div>
        )}

        <div
          className="grid gap-3 mb-5"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          <label className="flex flex-col text-white">
            Nome/Sobrenome:
            <input
              type="text"
              placeholder="Início do nome ou sobrenome"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="filtro-input mt-1"
            />
          </label>

          <label className="flex flex-col text-white">
            Nacionalidade:
            <select
              value={filtroNacionalidade}
              onChange={(e) => setFiltroNacionalidade(e.target.value)}
              className="filtro-select mt-1"
            >
              <option value="">Todas</option>
              {nacionalidadesUnicas.map((nac) => (
                <option key={nac} value={nac}>
                  {nac}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-white">
            Posição:
            <select
              value={filtroPosicao}
              onChange={(e) => setFiltroPosicao(e.target.value)}
              className="filtro-select mt-1"
            >
              <option value="">Todas</option>
              {posicoes.map((p) => (
                <option key={p.sigla} value={p.sigla}>
                  [{p.sigla}] {p.descricao}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-white">
            Clube:
            <select
              value={filtroClube}
              onChange={(e) => setFiltroClube(e.target.value)}
              className="filtro-select mt-1"
            >
              <option value="">Todos</option>
              {clubesUnicos.map((clube) => (
                <option key={clube} value={clube}>
                  {clube}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <button
            onClick={() => {
              setOrdenarPorPosicao(false);
              setOrdenarAsc((prev) => !prev);
            }}
            title="Ordenar por nome"
            className={`border rounded px-3 py-1 min-w-[120px] flex items-center justify-center gap-2 font-semibold transition ${ordenarPorPosicao
              ? 'border-purple-700 text-gray-400 cursor-default'
              : 'border-purple-700 text-white hover:bg-lightGreen'
              }`}
          >
            <AiOutlineSortAscending size={18} />
            {ordenarAsc ? 'A → Z' : 'Z → A'}
          </button>

          <button
            onClick={() => {
              setOrdenarPorPosicao(true);
              setOrdenarPosicaoAsc((prev) => !prev);
            }}
            title="Ordenar por posição"
            className={`border rounded px-3 py-1 min-w-[120px] flex items-center justify-center gap-2 font-semibold transition ${ordenarPorPosicao
              ? 'border-purple-700 text-white hover:bg-lightGreen'
              : 'border-purple-700 text-gray-400 cursor-default'
              }`}
          >
            <GiPuzzle size={18} />
            {ordenarPosicaoAsc ? 'Posição ↑' : 'Posição ↓'}
          </button>
        </div>

        <ul
          className="lista-clubes"
          style={{
            paddingLeft: 0,
            marginBottom: 0,
            maxHeight: 400,
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          {atletasFiltrados.length > 0 ? (
            atletasFiltrados.map((a) => (
              <li
                key={a.atletaId}
                className={`item-clube ${atletaIncompleto(a) ? 'piscar-alerta' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--secondaryPurple)',
                  color: 'white',
                  gap: 6,
                  fontSize: 14,
                }}
                title={`${a.nome} ${a.sobrenome} (${a.posicao}) - ${a.nacionalidade}`}
              >
                {/* Linha principal com nome, posição, nacionalidade e botões */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {a.nome} {a.sobrenome} ({a.posicao}) - {a.nacionalidade}
                  </span>

                  <div
                    className="acoes"
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      flexShrink: 0,
                      alignItems: 'center',
                    }}
                  >
                    <button
                      title="Editar"
                      onClick={() => irParaEditar(a.atletaId)}
                      aria-label={`Editar atleta ${a.nome} ${a.sobrenome}`}
                      className="btn-icon btn-edit"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 4,
                      }}
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      title="Deletar"
                      onClick={() => deletarAtleta(a)}
                      aria-label={`Deletar atleta ${a.nome} ${a.sobrenome}`}
                      className="btn-icon btn-delete"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 4,
                      }}
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <button
                      title="Estatísticas"
                      onClick={() => toggleEstatisticas(a)}
                      aria-label={`Mostrar estatísticas do atleta ${a.nome} ${a.sobrenome}`}
                      className="btn-icon btn-stats"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 4,
                      }}
                    >
                      <FiBarChart2 size={18} />
                    </button>
                    <button
                      title="Transferir Atleta"
                      onClick={() => toggleTransferirPanel(a.atletaId)}
                      aria-label={`Transferir atleta ${a.nome} ${a.sobrenome}`}
                      className="btn-icon btn-transfer"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 4,
                      }}
                    >
                      <FiRepeat size={18} />
                    </button>
                  </div>
                </div>

                {/* Painel compacto de estatísticas */}
                {estatisticaAberta === a.atletaId && (
                  <div
                    className="estatisticas-painel"
                    style={{
                      marginTop: 6,
                      backgroundColor: 'var(--primaryPurple)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      maxHeight: 140,
                      overflowY: 'auto',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE 10+
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                      }}
                    >
                      {/* Gols */}
                      <div
                        className="estatistica-item"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: 60,
                        }}
                      >
                        <strong>Gols</strong>
                        <span style={{ fontSize: 20, fontWeight: 'bold' }}>
                          {dadosEstatistica[a.atletaId]?.gols ?? 0}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <button
                            onClick={() =>
                              handleIncrementarEstatistica(a.atletaId, 'gols', 1)
                            }
                            aria-label="Adicionar gol"
                            className="btn-icon"
                            style={{
                              border: '1px solid white',
                              borderRadius: 4,
                              padding: '2px 6px',
                              color: 'white',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AiOutlinePlus size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleIncrementarEstatistica(a.atletaId, 'gols', -1)
                            }
                            aria-label="Remover gol"
                            className="btn-icon"
                            style={{
                              border: '1px solid white',
                              borderRadius: 4,
                              padding: '2px 6px',
                              color: 'white',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AiOutlineMinus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Assistências */}
                      <div
                        className="estatistica-item"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: 60,
                        }}
                      >
                        <strong>Assistências</strong>
                        <span style={{ fontSize: 20, fontWeight: 'bold' }}>
                          {dadosEstatistica[a.atletaId]?.assistencias ?? 0}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <button
                            onClick={() =>
                              handleIncrementarEstatistica(
                                a.atletaId,
                                'assistencias',
                                1
                              )
                            }
                            aria-label="Adicionar assistência"
                            className="btn-icon"
                            style={{
                              border: '1px solid white',
                              borderRadius: 4,
                              padding: '2px 6px',
                              color: 'white',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AiOutlinePlus size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleIncrementarEstatistica(
                                a.atletaId,
                                'assistencias',
                                -1
                              )
                            }
                            aria-label="Remover assistência"
                            className="btn-icon"
                            style={{
                              border: '1px solid white',
                              borderRadius: 4,
                              padding: '2px 6px',
                              color: 'white',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <AiOutlineMinus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Painel compacto de transferência */}
                {atletaParaTransferirId === a.atletaId && (
                  <div
                    style={{
                      marginTop: 6,
                      backgroundColor: 'var(--primaryPurple)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      maxHeight: 140,
                      overflowY: 'auto',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE 10+
                    }}
                  >
                    <TransferirAtletaPanel
                      atleta={a}
                      onCancel={fecharTransferirPanel}
                      onTransferenciaFeita={(msg, isErro) => {
                        setMensagem(msg);
                        setErro(isErro);
                        if (!isErro) {
                          buscarAtletas();
                          fecharTransferirPanel();
                        }
                      }}
                    />
                  </div>
                )}
              </li>
            ))
          ) : (
            <li
              style={{
                color: 'white',
                padding: '0.75rem',
                textAlign: 'center',
                fontSize: 16,
              }}
            >
              Nenhum atleta encontrado.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

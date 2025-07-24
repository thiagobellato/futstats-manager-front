import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GerenciarAtleta() {
  const [atletas, setAtletas] = useState([]);
  const [posicoes, setPosicoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  // Estado que controla qual estatística está aberta (atletaId ou null)
  const [estatisticaAberta, setEstatisticaAberta] = useState(null);
  const [dadosEstatistica, setDadosEstatistica] = useState({});

  const [ordenarAsc, setOrdenarAsc] = useState(true);
  const [ordenarPorPosicao, setOrdenarPorPosicao] = useState(false);
  const [ordenarPosicaoAsc, setOrdenarPosicaoAsc] = useState(true);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroNacionalidade, setFiltroNacionalidade] = useState('');
  const [filtroPosicao, setFiltroPosicao] = useState('');
  const [filtroClube, setFiltroClube] = useState('');

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
    const confirmacao = window.confirm(`Tem certeza que deseja deletar o atleta "${atleta.nome} ${atleta.sobrenome}"?`);
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
    return !atleta.posicao || !atleta.clubeNome || atleta.clubeNome === "Sem Clube";
  };

  // Abre ou fecha a estatística; fecha outras se abrir outra
  const handleToggleEstatisticas = (atleta) => {
    const atletaId = atleta.atletaId;
    const clubeId = atleta.clube?.clubeId ?? atleta.clubeId;

    if (estatisticaAberta === atletaId) {
      // Se já está aberto, fecha
      setEstatisticaAberta(null);
      return;
    }

    // Caso contrário, tenta abrir a estatística
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

        setDadosEstatistica((prevDados) => ({
          ...prevDados,
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
          console.error('Erro ao buscar estatísticas:', err);
          setEstatisticaAberta(null);
        }
      });
  };

  const handleIncrementarEstatistica = (atleta, campo, delta) => {
    const atletaId = atleta.atletaId;
    const valorAtual = dadosEstatistica[atletaId]?.[campo] ?? 0;
    const novoValor = Math.max(0, valorAtual + delta);

    setDadosEstatistica((prev) => ({
      ...prev,
      [atletaId]: {
        ...prev[atletaId],
        [campo]: novoValor,
      },
    }));

    salvarEstatisticasComValores(atleta, {
      ...dadosEstatistica[atletaId],
      [campo]: novoValor,
    });
  };

  const salvarEstatisticasComValores = async (atleta, valores) => {
    const atletaId = atleta.atletaId;
    const clubeId = atleta.clube?.clubeId ?? atleta.clubeId;

    if (!clubeId) {
      setMensagem('Esse atleta não está vinculado a nenhum clube.');
      setErro(true);
      return;
    }

    const dadosParaEnviar = {
      atletaId: atletaId,
      clubeId: clubeId,
      gols: valores?.gols ?? 0,
      assistencias: valores?.assistencias ?? 0,
    };

    try {
      await axios.put(
        'http://localhost:8080/api/estatistica/atualizar',
        dadosParaEnviar,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMensagem('Estatísticas atualizadas com sucesso.');
      setErro(false);
    } catch (err) {
      const msgErroBackend = err.response?.data?.message || err.message || 'Erro desconhecido';
      setMensagem(`Erro ao atualizar estatísticas: ${msgErroBackend}`);
      setErro(true);
      console.error('Erro ao atualizar estatísticas:', err);
    }
  };

  const nacionalidadesUnicas = [...new Set(atletas.map(a => a.nacionalidade))];
  const clubesUnicos = [...new Set(atletas.map(a => a.clubeNome))];

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
    const ordemEnum = posicoes.map(p => p.sigla);
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

  return (
    <div className="form-card">
      <div
        className="botao-voltar-circular"
        onClick={() => navigate('/menu-atleta')}
        title="Voltar para Menu Atleta"
        style={{ cursor: 'pointer', marginBottom: '20px' }}
      >
        ←
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gerenciar Atletas</h2>
        <div>
          <button
            onClick={() => {
              setOrdenarPorPosicao(false);
              setOrdenarAsc((prev) => !prev);
            }}
            title="Ordenar por nome"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              marginRight: '8px',
              color: ordenarPorPosicao ? 'gray' : '#facc15',
            }}
          >
            🔤
          </button>
          <button
            onClick={() => {
              setOrdenarPorPosicao(true);
              setOrdenarPosicaoAsc((prev) => !prev);
            }}
            title="Ordenar por posição"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: ordenarPorPosicao ? '#facc15' : 'gray',
            }}
          >
            🧩
          </button>
        </div>
      </div>

      {mensagem && <div className={`mensagem ${erro ? 'erro' : 'sucesso'}`}>{mensagem}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Nome/Sobrenome:{' '}
          <input
            type="text"
            placeholder="Buscar nome ou sobrenome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Nacionalidade:{' '}
          <select value={filtroNacionalidade} onChange={(e) => setFiltroNacionalidade(e.target.value)}>
            <option value="">Todas</option>
            {nacionalidadesUnicas.map((nac, index) => (
              <option key={index} value={nac}>
                {nac}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Posição:{' '}
          <select value={filtroPosicao} onChange={(e) => setFiltroPosicao(e.target.value)}>
            <option value="">Todas</option>
            {posicoes.map((p, index) => (
              <option key={index} value={p.sigla}>
                [{p.sigla}] {p.descricao}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Clube:{' '}
          <select value={filtroClube} onChange={(e) => setFiltroClube(e.target.value)}>
            <option value="">Todos</option>
            {clubesUnicos.map((clube, index) => (
              <option key={index} value={clube}>
                {clube}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="lista-clubes">
        {atletasFiltrados.length > 0 ? (
          atletasFiltrados.map((a) => (
            <li
              key={a.atletaId}
              className={`item-clube ${atletaIncompleto(a) ? 'piscar-alerta' : ''}`}
            >
              <span>
                {a.nome} {a.sobrenome} ({a.posicao}) - {a.nacionalidade}
                {atletaIncompleto(a) && (
                  <span title="Cadastro incompleto" style={{ marginLeft: 8, color: 'orange' }}>
                    ⚠️
                  </span>
                )}
              </span>
              <div className="acoes">
                <button title="Editar" onClick={() => irParaEditar(a.atletaId)}>
                  ✏️
                </button>
                <button title="Deletar" onClick={() => deletarAtleta(a)}>🗑️</button>
                <button title="Estatísticas" onClick={() => handleToggleEstatisticas(a)}>
                  📊
                </button>
              </div>

              {estatisticaAberta === a.atletaId && (
                <div className="estatisticas-panel" style={{ marginTop: '0.5rem' }}>
                  {/* Gols */}
                  <div className="estatistica-linha">
                    <button
                      type="button"
                      onClick={() => handleIncrementarEstatistica(a, 'gols', -1)}
                      disabled={(dadosEstatistica[a.atletaId]?.gols ?? 0) <= 0}
                      title="Diminuir gols"
                      className="botao-estatistica"
                    >
                      −
                    </button>

                    {/* CAMPO VISUAL SEM INPUT, só um span */}
                    <span
                      className="campo-estatistica"
                      title={`${dadosEstatistica[a.atletaId]?.gols ?? 0} gols`}
                      aria-label="Quantidade de gols"
                    >
                      {dadosEstatistica[a.atletaId]?.gols ?? 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleIncrementarEstatistica(a, 'gols', 1)}
                      title="Aumentar gols"
                      className="botao-estatistica"
                    >
                      +
                    </button>
                    <span className="label-estatistica">Gols</span>
                  </div>

                  {/* Assistências */}
                  <div className="estatistica-linha">
                    <button
                      type="button"
                      onClick={() => handleIncrementarEstatistica(a, 'assistencias', -1)}
                      disabled={(dadosEstatistica[a.atletaId]?.assistencias ?? 0) <= 0}
                      title="Diminuir assistências"
                      className="botao-estatistica"
                    >
                      −
                    </button>

                    {/* CAMPO VISUAL SEM INPUT */}
                    <span
                      className="campo-estatistica"
                      title={`${dadosEstatistica[a.atletaId]?.assistencias ?? 0} assistências`}
                      aria-label="Quantidade de assistências"
                    >
                      {dadosEstatistica[a.atletaId]?.assistencias ?? 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleIncrementarEstatistica(a, 'assistencias', 1)}
                      title="Aumentar assistências"
                      className="botao-estatistica"
                    >
                      +
                    </button>
                    <span className="label-estatistica">Assistências</span>
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <li>Nenhum atleta encontrado com esses filtros.</li>
        )}
      </ul>
    </div>
  );
}

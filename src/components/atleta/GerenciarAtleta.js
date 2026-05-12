import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransferirAtletaPanel from './TransferirAtletaPanel';
import { Edit2, Trash2, BarChart2, Repeat, Filter, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Input';
import SearchableSelect from '../ui/SearchableSelect';
import Badge from '../ui/Badge';
import { nacionalidadesSelect } from '../../data/nacionalidades';
import Pagination from '../ui/Pagination';

export default function GerenciarAtleta() {
  // Carregar estado salvo do sessionStorage
  const savedState = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('futstats_atleta_filtros') || '{}');
    } catch (e) {
      return {};
    }
  }, []);

  const [atletas, setAtletas] = useState([]);
  const [posicoes, setPosicoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [estatisticaAberta, setEstatisticaAberta] = useState(null);
  const [dadosEstatistica, setDadosEstatistica] = useState({});
  const [ordenarAsc, setOrdenarAsc] = useState(savedState.ordenarAsc ?? true);
  const [ordenarPorPosicao, setOrdenarPorPosicao] = useState(savedState.ordenarPorPosicao ?? false);
  const [ordenarPosicaoAsc, setOrdenarPosicaoAsc] = useState(savedState.ordenarPosicaoAsc ?? true);
  const [filtroNome, setFiltroNome] = useState(savedState.filtroNome ?? '');
  const [filtroNacionalidade, setFiltroNacionalidade] = useState(savedState.filtroNacionalidade ?? '');
  const [filtroPosicao, setFiltroPosicao] = useState(savedState.filtroPosicao ?? '');
  const [filtroClube, setFiltroClube] = useState(savedState.filtroClube ?? '');
  const [atletaParaTransferirId, setAtletaParaTransferirId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(savedState.paginaAtual ?? 1);
  const itensPorPagina = 50;

  const isInitialMount = useRef(true);
  const navigate = useNavigate();

  // Salvar estado no sessionStorage sempre que mudar
  useEffect(() => {
    const stateToSave = {
      ordenarAsc,
      ordenarPorPosicao,
      ordenarPosicaoAsc,
      filtroNome,
      filtroNacionalidade,
      filtroPosicao,
      filtroClube,
      paginaAtual
    };
    sessionStorage.setItem('futstats_atleta_filtros', JSON.stringify(stateToSave));
  }, [ordenarAsc, ordenarPorPosicao, ordenarPosicaoAsc, filtroNome, filtroNacionalidade, filtroPosicao, filtroClube, paginaAtual]);

  useEffect(() => {
    buscarAtletas();
    buscarPosicoes();
  }, []);

  // Resetar para página 1 ao filtrar (exceto no mount inicial se houver estado salvo)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPaginaAtual(1);
  }, [filtroNome, filtroNacionalidade, filtroPosicao, filtroClube]);

  const buscarAtletas = async () => {
    setLoading(true);
    try {
      const resposta = await axios.get('http://localhost:8080/api/atleta');
      setAtletas(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (err) {
      setMensagem('Erro ao buscar atletas.');
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  const buscarPosicoes = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/enums/posicoes');
      setPosicoes(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (err) {
      console.error('Erro ao buscar posições:', err);
    }
  };

  const deletarAtleta = async (atleta) => {
    if (!atleta) return;
    const confirmacao = window.confirm(
      `Tem certeza que deseja deletar o atleta "${atleta.nome || ''} ${atleta.sobrenome || ''}"?`
    );
    if (!confirmacao) return;

    try {
      await axios.delete(`http://localhost:8080/api/atleta/deletar/${atleta.atletaId}`);
      setMensagem(`Atleta "${atleta.nome || 'selecionado'}" deletado com sucesso!`);
      setErro(false);
      buscarAtletas();
    } catch (err) {
      setMensagem(`Erro ao deletar o atleta.`);
      setErro(true);
    }
  };

  const irParaEditar = (id) => {
    navigate(`/menu-atleta/gerenciar/editar?id=${id}`);
  };

  const atletaIncompleto = (atleta) => {
    if (!atleta) return true;
    return !atleta.posicao || !atleta.clubeNome || atleta.clubeNome === 'Sem Clube';
  };

  const toggleEstatisticas = (atleta) => {
    if (!atleta) return;
    const atletaId = atleta.atletaId;
    const clubeId = atleta.clube?.clubeId ?? atleta.clubeId;

    setAtletaParaTransferirId(null);

    if (estatisticaAberta === atletaId) {
      setEstatisticaAberta(null);
      return;
    }

    if (!clubeId) {
      setMensagem('Atleta sem clube vinculado.');
      setErro(true);
      return;
    }

    axios
      .get(`http://localhost:8080/api/estatistica/${atletaId}/${clubeId}`)
      .then((res) => {
        const estat = res.data;
        if (!estat) {
          setMensagem('Nenhuma estatística encontrada.');
          setErro(false);
          return;
        }

        setDadosEstatistica((prev) => ({
          ...prev,
          [atletaId]: {
            gols: estat.gols ?? 0,
            assistencias: estat.assistencias ?? 0,
            cartaoAmarelo: estat.cartaoAmarelo ?? 0,
            cartaoVermelho: estat.cartaoVermelho ?? 0,
          },
        }));

        setEstatisticaAberta(atletaId);
      })
      .catch((err) => {
        setMensagem('Erro ao carregar estatísticas.');
        setErro(true);
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

    if (!clubeId) return;

    const dadosParaEnviar = {
      atletaId,
      clubeId,
      gols: valores?.gols ?? 0,
      assistencias: valores?.assistencias ?? 0,
      cartaoAmarelo: valores?.cartaoAmarelo ?? 0,
      cartaoVermelho: valores?.cartaoVermelho ?? 0,
    };

    try {
      await axios.put('http://localhost:8080/api/estatistica/atualizar', dadosParaEnviar);
    } catch (err) {
      setMensagem('Erro ao atualizar estatísticas.');
      setErro(true);
    }
  };

  const toggleTransferirPanel = (atletaId) => {
    setEstatisticaAberta(null);
    setAtletaParaTransferirId(atletaParaTransferirId === atletaId ? null : atletaId);
  };

  const handleTransferenciaFeita = (msg, isErro) => {
    setMensagem(msg);
    setErro(isErro);
    if (!isErro) buscarAtletas();
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroNacionalidade('');
    setFiltroPosicao('');
    setFiltroClube('');
    setPaginaAtual(1);
    sessionStorage.removeItem('futstats_atleta_filtros');
  };

  const nacionalidadesUnicas = useMemo(() => [...new Set(atletas.map((a) => a.nacionalidade).filter(Boolean))], [atletas]);
  const clubesUnicos = useMemo(() => [...new Set(atletas.map((a) => a.clubeNome).filter(Boolean))], [atletas]);

  // Lógica de Filtragem e Ordenação Otimizada com useMemo
  const atletasFiltrados = useMemo(() => {
    let filtrados = atletas.filter((a) => {
      const buscaNome = (a.nome ?? '').toLowerCase().includes(filtroNome.toLowerCase()) ||
                      (a.sobrenome ?? '').toLowerCase().includes(filtroNome.toLowerCase());
      const buscaNacionalidade = filtroNacionalidade ? a.nacionalidade === filtroNacionalidade : true;
      const buscaPosicao = filtroPosicao ? a.posicao === filtroPosicao : true;
      const buscaClube = filtroClube ? a.clubeNome === filtroClube : true;
      return buscaNome && buscaNacionalidade && buscaPosicao && buscaClube;
    });

    if (ordenarPorPosicao) {
      const ordemEnum = posicoes.map((p) => p.sigla);
      filtrados = [...filtrados].sort((a, b) => {
        const indexA = ordemEnum.indexOf(a.posicao);
        const indexB = ordemEnum.indexOf(b.posicao);
        return ordenarPosicaoAsc ? indexA - indexB : indexB - indexA;
      });
    } else {
      filtrados = [...filtrados].sort((a, b) => {
        const nomeA = `${a.nome || ''} ${a.sobrenome || ''}`.toLowerCase();
        const nomeB = `${b.nome || ''} ${b.sobrenome || ''}`.toLowerCase();
        return ordenarAsc ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
      });
    }
    return filtrados;
  }, [atletas, filtroNome, filtroNacionalidade, filtroPosicao, filtroClube, ordenarPorPosicao, ordenarAsc, ordenarPosicaoAsc, posicoes]);

  // Aplicar Paginação
  const totalPaginas = Math.ceil(atletasFiltrados.length / itensPorPagina);
  const atletasPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return atletasFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [atletasFiltrados, paginaAtual, itensPorPagina]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Atletas</h2>
          <p className="text-brand-muted text-sm">Visualize e administre todos os atletas do sistema. ({atletasFiltrados.length} encontrados)</p>
        </div>
        <Button onClick={() => navigate('/menu-atleta/cadastrar')} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Atleta
        </Button>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg flex items-center justify-between animate-in slide-in-from-top duration-300 ${erro ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
          <span>{mensagem}</span>
          <button onClick={() => setMensagem('')} className="text-sm font-bold opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Input
            label="Nome ou Sobrenome"
            placeholder="Buscar..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <SearchableSelect
            label="Nacionalidade"
            value={filtroNacionalidade}
            onChange={(e) => setFiltroNacionalidade(e.target.value)}
            options={[
              { value: '', label: 'Todas', flag: '🌍' },
              ...nacionalidadesSelect
            ]}
            placeholder="Filtrar por país..."
          />
          <Select
            label="Posição"
            value={filtroPosicao}
            onChange={(e) => setFiltroPosicao(e.target.value)}
            options={[
              { value: '', label: 'Todas' },
              ...posicoes.map(p => ({ value: p.sigla, label: `[${p.sigla}] ${p.descricao || p.sigla}` }))
            ]}
          />
          <Select
            label="Clube"
            value={filtroClube}
            onChange={(e) => setFiltroClube(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              ...clubesUnicos.map(c => ({ value: c, label: c }))
            ]}
          />
        </div>

        <div className="flex gap-2 mb-6 pb-6 border-b border-brand-border">
          <Button 
            variant={!ordenarPorPosicao ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => { setOrdenarPorPosicao(false); setOrdenarAsc(!ordenarAsc); }}
            className="gap-2"
          >
            Nome {!ordenarPorPosicao && (ordenarAsc ? 'A-Z' : 'Z-A')}
          </Button>
          <Button 
            variant={ordenarPorPosicao ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => { setOrdenarPorPosicao(true); setOrdenarPosicaoAsc(!ordenarPosicaoAsc); }}
            className="gap-2"
          >
            Posição {ordenarPorPosicao && (ordenarPosicaoAsc ? '↑' : '↓')}
          </Button>
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="ml-auto text-brand-muted">
            Limpar Filtros
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-xs uppercase tracking-wider">
                    <th className="px-4 py-4 font-semibold">Atleta</th>
                    <th className="px-4 py-4 font-semibold">Clube</th>
                    <th className="px-4 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {atletasPaginados.map((a) => (
                    <React.Fragment key={a.atletaId}>
                      <tr className={`group transition-colors ${atletaIncompleto(a) ? 'bg-yellow-500/5' : 'hover:bg-brand-dark/30'}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center text-[10px] font-bold text-white uppercase">
                              {a.nome?.charAt(0) || '?'}{a.sobrenome?.charAt(0) || ''}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-brand-primary transition-colors">
                                {a.nome || 'Sem Nome'} {a.sobrenome || ''}
                              </div>
                              <div className="text-xs text-brand-muted flex items-center gap-2">
                                <Badge variant="default" className="py-0">{a.posicao || '---'}</Badge>
                                {atletaIncompleto(a) && <span className="text-yellow-500 text-[10px] uppercase font-bold">Incompleto</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-brand-muted text-sm">{a.clubeNome || 'Sem Clube'}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleEstatisticas(a)} title="Estatísticas">
                              <BarChart2 className={`w-4 h-4 ${estatisticaAberta === a.atletaId ? 'text-brand-primary' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleTransferirPanel(a.atletaId)} title="Transferir">
                              <Repeat className={`w-4 h-4 ${atletaParaTransferirId === a.atletaId ? 'text-brand-primary' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => irParaEditar(a.atletaId)} title="Editar">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={() => deletarAtleta(a)} title="Deletar">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Stats Panel */}
                      {estatisticaAberta === a.atletaId && (
                        <tr>
                          <td colSpan="3" className="px-4 py-0">
                            <div className="bg-brand-dark/50 border-x border-brand-border p-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                                {[
                                  { label: 'Gols', field: 'gols', color: 'text-brand-primary' },
                                  { label: 'Assistências', field: 'assistencias', color: 'text-blue-500' },
                                  { label: 'C. Amarelo', field: 'cartaoAmarelo', isYellow: true, color: 'text-yellow-500' },
                                  { label: 'C. Vermelho', field: 'cartaoVermelho', isRed: true, color: 'text-red-500' },
                                ].map((stat) => (
                                  <div key={stat.field} className="text-center p-3 bg-brand-card rounded-xl border border-brand-border relative overflow-hidden group">
                                    {stat.isYellow && <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>}
                                    {stat.isRed && <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>}
                                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-2">{stat.label}</p>
                                    <div className="flex items-center justify-center gap-3 mt-1">
                                      <button 
                                        onClick={() => handleIncrementarEstatistica(a.atletaId, stat.field, -1)}
                                        className="p-1.5 rounded-lg bg-brand-dark hover:bg-brand-border text-white transition-colors"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className={`text-xl font-black w-8 text-center ${stat.color}`}>{dadosEstatistica[a.atletaId]?.[stat.field] ?? 0}</span>
                                      <button 
                                        onClick={() => handleIncrementarEstatistica(a.atletaId, stat.field, 1)}
                                        className="p-1.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expandable Transfer Panel */}
                      {atletaParaTransferirId === a.atletaId && (
                        <tr>
                          <td colSpan="3" className="px-4 py-0">
                            <div className="bg-brand-dark/50 border-x border-brand-border p-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="max-w-md mx-auto">
                                <TransferirAtletaPanel 
                                  atleta={a} 
                                  onCancel={() => setAtletaParaTransferirId(null)}
                                  onTransferenciaFeita={handleTransferenciaFeita}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination 
              currentPage={paginaAtual} 
              totalPages={totalPaginas} 
              onPageChange={setPaginaAtual} 
            />
          </>
        )}
      </Card>
    </div>
  );
}

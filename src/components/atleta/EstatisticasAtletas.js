import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Award, ChevronDown, ChevronUp, Filter, Target, Zap, BarChart2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Select } from '../ui/Input';
import Badge from '../ui/Badge';

export default function EstatisticasAtletas() {
  const [estatisticas, setEstatisticas] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('gols');
  const [expandedAtleta, setExpandedAtleta] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoading(true);
    try {
      const [resEstatisticas, resAtletas] = await Promise.all([
        axios.get('http://localhost:8080/api/estatistica'),
        axios.get('http://localhost:8080/api/atleta'),
      ]);
      setEstatisticas(Array.isArray(resEstatisticas.data) ? resEstatisticas.data : []);
      setAtletas(Array.isArray(resAtletas.data) ? resAtletas.data : []);
    } catch (err) {
      setMensagem('Erro ao buscar dados.');
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  const clubeAtualPorId = atletas.reduce((acc, atleta) => {
    if (!atleta) return acc;
    const chave = `${atleta.atletaId}-${atleta.nome}`;
    acc[chave] = atleta.clubeNome || 'Sem clube atual';
    return acc;
  }, {});

  const estatisticasPorAtleta = estatisticas.reduce((acc, stat) => {
    if (!stat) return acc;
    const chave = `${stat.atletaId}-${stat.nomeAtleta}`;

    if (!acc[chave]) {
      acc[chave] = {
        id: stat.atletaId,
        nome: stat.nomeAtleta || 'Sem Nome',
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
      clube: stat.nomeClube || 'Desconhecido',
      gols: stat.gols || 0,
      assistencias: stat.assistencias || 0,
      cartaoAmarelo: stat.cartaoAmarelo || 0,
      cartaoVermelho: stat.cartaoVermelho || 0,
    });

    return acc;
  }, {});

  const atletasArray = Object.values(estatisticasPorAtleta);

  const atletasOrdenados = [...atletasArray].sort((a, b) => {
    if (ordenarPor === 'nome') return (a.nome || '').localeCompare(b.nome || '');
    return (b[ordenarPor] || 0) - (a[ordenarPor] || 0);
  });

  const rankingGols = [...atletasArray].sort((a, b) => b.gols - a.gols).slice(0, 3);
  const rankingAssistencias = [...atletasArray].sort((a, b) => b.assistencias - a.assistencias).slice(0, 3);

  const toggleExpandir = (chave) => {
    setExpandedAtleta(expandedAtleta === chave ? null : chave);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Estatísticas Gerais</h2>
          <p className="text-brand-muted text-sm">Rankings e histórico de desempenho dos atletas.</p>
        </div>
      </div>

      {/* Top Rankings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Top Goleadores" subtitle="Maiores marcadores da temporada">
          <div className="space-y-4">
            {rankingGols.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-brand-dark rounded-lg border border-brand-border group hover:border-brand-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-yellow-500 text-brand-dark' : i === 1 ? 'bg-gray-300 text-brand-dark' : 'bg-amber-600 text-brand-dark'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{a.nome}</p>
                    <p className="text-xs text-brand-muted">{a.clube}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-brand-primary font-black text-xl">
                  {a.gols} <Target className="w-4 h-4 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Assistentes" subtitle="Maiores garçons da temporada">
          <div className="space-y-4">
            {rankingAssistencias.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-brand-dark rounded-lg border border-brand-border group hover:border-brand-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-yellow-500 text-brand-dark' : i === 1 ? 'bg-gray-300 text-brand-dark' : 'bg-amber-600 text-brand-dark'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{a.nome}</p>
                    <p className="text-xs text-brand-muted">{a.clube}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-500 font-black text-xl">
                  {a.assistencias} <Zap className="w-4 h-4 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Ranking Table */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end justify-between border-b border-brand-border pb-6">
          <div className="w-full md:w-64">
            <Select
              label="Ordenar Ranking"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              options={[
                { value: 'gols', label: 'Mais Gols' },
                { value: 'assistencias', label: 'Mais Assistências' },
                { value: 'nome', label: 'Ordem Alfabética' },
              ]}
            />
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4">
              <p className="text-[10px] text-brand-muted uppercase font-bold tracking-tighter">Total Gols</p>
              <p className="text-xl font-black text-white">{atletasArray.reduce((acc, curr) => acc + curr.gols, 0)}</p>
            </div>
            <div className="text-center px-4 border-l border-brand-border">
              <p className="text-[10px] text-brand-muted uppercase font-bold tracking-tighter">Total Assist.</p>
              <p className="text-xl font-black text-white">{atletasArray.reduce((acc, curr) => acc + curr.assistencias, 0)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {atletasOrdenados.map((e) => {
            const chave = `${e.id}-${e.nome}`;
            const isExpanded = expandedAtleta === chave;
            return (
              <div key={chave} className="border border-brand-border rounded-xl overflow-hidden group transition-all hover:border-brand-primary/50">
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-brand-dark/50' : 'hover:bg-brand-dark/30'}`}
                  onClick={() => toggleExpandir(chave)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-border flex items-center justify-center text-sm font-bold text-white uppercase border border-brand-border">
                      {(e.nome || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-brand-primary transition-colors">{e.nome}</p>
                      <p className="text-xs text-brand-muted">{e.clube}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center w-12">
                      <p className="text-[10px] text-brand-muted uppercase font-bold">Gols</p>
                      <p className="font-black text-brand-primary">{e.gols}</p>
                    </div>
                    <div className="text-center w-12">
                      <p className="text-[10px] text-brand-muted uppercase font-bold">Ass.</p>
                      <p className="font-black text-blue-500">{e.assistencias}</p>
                    </div>
                    <div className="flex gap-1 items-center ml-4">
                      {e.cartaoAmarelo > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                           <div className="w-2 h-3 bg-yellow-500 rounded-sm"></div> {e.cartaoAmarelo}
                        </div>
                      )}
                      {e.cartaoVermelho > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                           <div className="w-2 h-3 bg-red-500 rounded-sm"></div> {e.cartaoVermelho}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-brand-muted">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-brand-dark/80 border-t border-brand-border animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">Histórico por Clube</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {e.historico.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-brand-card rounded-lg border border-brand-border/50">
                          <span className="font-bold text-sm text-white">{h.clube}</span>
                          <div className="flex gap-4">
                            <span className="text-xs font-bold text-brand-primary">{h.gols} Gols</span>
                            <span className="text-xs font-bold text-blue-500">{h.assistencias} Ass.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

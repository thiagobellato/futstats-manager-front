import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  TrendingUp,
  Activity,
  Award,
  BarChart2,
  PlusCircle,
  Target,
  Zap,
  AlertTriangle,
  XOctagon,
  Clock
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

export default function MenuInicial() {
  const [stats, setStats] = useState({
    totalAtletas: 0,
    totalClubes: 0,
    topGoleador: '---',
    topGoleadorGols: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recente';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 15) return 'Agora mesmo';
    if (diff < 60) return 'Há poucos segundos';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    return `há ${Math.floor(diff / 86400)} dias`;
  };

  const clearFeed = () => {
    // Limpa os eventos da sessão
    sessionStorage.removeItem('futstats_events');
    
    // IMPORTANTE: Sincroniza o baseline com o estado atual do banco
    // para que nada antigo seja detectado como "novo" após a limpeza
    const currentStatsStr = localStorage.getItem('futstats_prev_stats');
    if (currentStatsStr) {
      localStorage.setItem('futstats_baseline_stats', currentStatsStr);
    }
    
    const knownAtletas = JSON.parse(localStorage.getItem('futstats_known_atletas') || '[]');
    const knownClubes = JSON.parse(localStorage.getItem('futstats_known_clubes') || '[]');
    // Marcamos todos os atuais como conhecidos
    localStorage.setItem('futstats_baseline_atletas', JSON.stringify(knownAtletas));
    localStorage.setItem('futstats_baseline_clubes', JSON.stringify(knownClubes));

    setStats(prev => ({ ...prev, recentActivity: [] }));
  };

  const fetchStats = async (isManualUpdate = false) => {
    if (!isManualUpdate) setLoading(true);
    
    try {
      const [atletasRes, clubesRes, estatRes] = await Promise.all([
        axios.get('http://localhost:8080/api/atleta'),
        axios.get('http://localhost:8080/api/clube'),
        axios.get('http://localhost:8080/api/estatistica')
      ]);

      const atletas = Array.isArray(atletasRes.data) ? atletasRes.data : [];
      const clubes = Array.isArray(clubesRes.data) ? clubesRes.data : [];
      const estats = Array.isArray(estatRes.data) ? estatRes.data : [];

      // 1. Calcular top goleador
      const top = estats.reduce((prev, current) => {
        return (prev.gols > current.gols) ? prev : current;
      }, { nomeAtleta: '---', gols: 0 });

      // 2. DETECÇÃO DE EVENTOS REAIS (MUDANÇAS)
      const prevStatsStr = localStorage.getItem('futstats_prev_stats');
      const prevStats = prevStatsStr ? JSON.parse(prevStatsStr) : null;
      const currentStats = {};
      const newEvents = [];

      estats.forEach(s => {
        const key = `${s.atletaId}-${s.nomeClube}`;
        currentStats[key] = { 
          gols: s.gols, 
          assistencias: s.assistencias, 
          amarelo: s.cartaoAmarelo, 
          vermelho: s.cartaoVermelho 
        };
        
        if (prevStats && prevStats[key]) {
          const prev = prevStats[key];
          // Só gera evento se o valor REALMENTE aumentou (evita ghosting por decremento/limpeza)
          if (s.gols > prev.gols) {
            newEvents.push({ 
              id: `gol-${s.atletaId}-${s.gols}-${Date.now()}`, type: 'gol', 
              title: `${s.nomeAtleta} marcou um GOL!`, desc: `Pelo ${s.nomeClube}`, 
              color: 'text-brand-neon', bg: 'bg-brand-neon/10', timestamp: Date.now() 
            });
          }
          if (s.assistencias > prev.assistencias) {
            newEvents.push({ 
              id: `ass-${s.atletaId}-${s.assistencias}-${Date.now()}`, type: 'ass', 
              title: `Assistência de ${s.nomeAtleta}`, desc: `Pelo ${s.nomeClube}`, 
              color: 'text-blue-400', bg: 'bg-blue-400/10', timestamp: Date.now() 
            });
          }
          if (s.cartaoAmarelo > prev.amarelo) {
            newEvents.push({ 
              id: `ca-${s.atletaId}-${s.cartaoAmarelo}-${Date.now()}`, type: 'ca', 
              title: `Cartão Amarelo: ${s.nomeAtleta}`, desc: `Pelo ${s.nomeClube}`, 
              color: 'text-yellow-500', bg: 'bg-yellow-500/10', timestamp: Date.now() 
            });
          }
          if (s.cartaoVermelho > prev.vermelho) {
            newEvents.push({ 
              id: `cv-${s.atletaId}-${s.cartaoVermelho}-${Date.now()}`, type: 'cv', 
              title: `EXPULSÃO! Cartão Vermelho`, desc: `${s.nomeAtleta} (${s.nomeClube})`, 
              color: 'text-red-500', bg: 'bg-red-500/10', timestamp: Date.now() 
            });
          }
        }
      });

      // 3. DETECÇÃO DE NOVAS ENTIDADES (SÓ NA SESSÃO ATUAL)
      const knownAtletas = JSON.parse(localStorage.getItem('futstats_known_atletas') || '[]');
      const knownClubes = JSON.parse(localStorage.getItem('futstats_known_clubes') || '[]');
      const knownAtletaIds = new Set(knownAtletas);
      const knownClubeIds = new Set(knownClubes);

      // Se é a primeira vez que carregamos, populamos os conhecidos e não geramos eventos
      if (knownAtletaIds.size === 0 && atletas.length > 0) {
        localStorage.setItem('futstats_known_atletas', JSON.stringify(atletas.map(a => a.atletaId)));
        localStorage.setItem('futstats_known_clubes', JSON.stringify(clubes.map(c => c.clubeId)));
      } else {
        // Detectar novos atletas
        atletas.forEach(a => {
          if (!knownAtletaIds.has(a.atletaId)) {
            newEvents.push({
              id: `new-atleta-${a.atletaId}`, type: 'atleta',
              title: `Novo Atleta: ${a.nome}`, desc: `${a.posicao} • ${a.clubeNome || 'Sem clube'}`,
              color: 'text-brand-primary', bg: 'bg-brand-primary/10', timestamp: Date.now()
            });
            knownAtletaIds.add(a.atletaId);
          }
        });
        // Detectar novos clubes
        clubes.forEach(c => {
          if (!knownClubeIds.has(c.clubeId)) {
            newEvents.push({
              id: `new-clube-${c.clubeId}`, type: 'clube',
              title: `Novo Clube: ${c.nome}`, desc: `${c.sigla} • ${c.pais}`,
              color: 'text-blue-500', bg: 'bg-blue-500/10', timestamp: Date.now()
            });
            knownClubeIds.add(c.clubeId);
          }
        });
        // Atualizar lista de conhecidos
        localStorage.setItem('futstats_known_atletas', JSON.stringify(Array.from(knownAtletaIds)));
        localStorage.setItem('futstats_known_clubes', JSON.stringify(Array.from(knownClubeIds)));
      }

      // Salvar baseline de estatísticas
      localStorage.setItem('futstats_prev_stats', JSON.stringify(currentStats));

      // 4. PERSISTIR EVENTOS REAIS
      const storedEventsStr = sessionStorage.getItem('futstats_events');
      let sessionEvents = storedEventsStr ? JSON.parse(storedEventsStr) : [];
      
      // Merge e deduplicação
      const sessionEventIds = new Set(sessionEvents.map(e => e.id));
      const filteredNewEvents = newEvents.filter(e => !sessionEventIds.has(e.id));

      sessionEvents = [...filteredNewEvents, ...sessionEvents].slice(0, 15);
      sessionStorage.setItem('futstats_events', JSON.stringify(sessionEvents));

      setStats({
        totalAtletas: atletas.length,
        totalClubes: clubes.length,
        topGoleador: top.nomeAtleta || '---',
        topGoleadorGols: top.gols || 0,
        recentActivity: sessionEvents.map(e => ({ ...e, time: formatRelativeTime(e.timestamp) }))
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      if (!isManualUpdate) setLoading(false);
    }
  };

  const IconMap = {
    gol: <Target className="w-4 h-4" />,
    ass: <Zap className="w-4 h-4" />,
    ca: <AlertTriangle className="w-4 h-4" />,
    cv: <XOctagon className="w-4 h-4" />,
    atleta: <Users className="w-4 h-4" />,
    clube: <Shield className="w-4 h-4" />
  };

  const statCards = [
    {
      title: 'Total de Atletas',
      value: stats.totalAtletas,
      icon: <Users className="w-6 h-6" />,
      color: 'text-brand-primary',
      trend: '+12% este mês'
    },
    {
      title: 'Clubes Ativos',
      value: stats.totalClubes,
      icon: <Shield className="w-6 h-6" />,
      color: 'text-blue-500',
      trend: '+2 novos'
    },
    {
      title: 'Top Goleador',
      value: (
        <div className="flex flex-col">
          <span>{stats.topGoleador}</span>
          <span className="text-sm text-brand-primary flex items-center gap-1 font-bold mt-1">
            <Target className="w-3 h-3" /> {stats.topGoleadorGols} gols
          </span>
        </div>
      ),
      icon: <Award className="w-6 h-6" />,
      color: 'text-yellow-500',
      trend: 'Destaque'
    },
    {
      title: 'Feed de Eventos',
      value: stats.recentActivity.length,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-brand-neon',
      trend: 'Ao vivo'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard <span className="text-brand-primary">Live</span></h2>
          <p className="text-brand-muted mt-1">Monitoramento em tempo real do sistema FutStats.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearFeed}
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            title="Limpar Histórico"
          >
            <Activity className="w-3 h-3" /> Limpar Feed
          </button>
          <button
            onClick={() => fetchStats(true)}
            className="p-2 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-brand-primary transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <Clock className="w-3 h-3" /> Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, i) => (
              <Card key={i} className="hover:border-brand-primary/50 transition-colors group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{card.title}</p>
                    <div className="text-3xl font-black text-white mt-2 group-hover:text-brand-primary transition-colors">{card.value}</div>
                  </div>
                  <div className={`p-3 rounded-xl bg-brand-dark border border-brand-border ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="neon" className="px-1.5 py-0.5 text-[9px] uppercase">{card.trend}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card
              title="Atividade Recente"
              subtitle="Eventos detectados nesta sessão"
              className="lg:col-span-2"
              headerAction={<Badge variant="neon" className="animate-pulse">Live Feed</Badge>}
            >
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.recentActivity.length > 0 ? stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between p-4 bg-brand-dark/40 rounded-2xl border border-brand-border hover:border-brand-primary/30 transition-all group animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-brand-border ${activity.bg} ${activity.color}`}>
                        {IconMap[activity.type] || <Activity className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{activity.title}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{activity.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-brand-muted uppercase tracking-tighter block whitespace-nowrap">{activity.time}</span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-12 text-brand-muted">
                    <Activity className="w-8 h-8 opacity-20 mb-3" />
                    <p className="italic text-sm">Nenhuma atividade recente encontrada nesta sessão.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Ações Rápidas">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate('/menu-atleta/cadastrar')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group w-full text-left"
                >
                  <PlusCircle className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
                  Novo Atleta
                </button>
                <button
                  onClick={() => navigate('/menu-clube/cadastrar')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group w-full text-left"
                >
                  <Shield className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  Novo Clube
                </button>
                <button
                  onClick={() => navigate('/menu-atleta/estatisticas')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group w-full text-left"
                >
                  <BarChart2 className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                  Ver Rankings
                </button>
                <button
                  onClick={() => navigate('/menu-atleta/gerenciar')}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group w-full text-left"
                >
                  <TrendingUp className="w-5 h-5 text-brand-neon group-hover:scale-110 transition-transform" />
                  Gerenciar Dados
                </button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

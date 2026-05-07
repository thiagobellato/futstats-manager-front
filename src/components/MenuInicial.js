import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Shield, TrendingUp, Activity, Award, BarChart2, PlusCircle } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

export default function MenuInicial() {
  const [stats, setStats] = useState({
    totalAtletas: 0,
    totalClubes: 0,
    topGoleador: '---',
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [atletasRes, clubesRes, estatRes] = await Promise.all([
          axios.get('http://localhost:8080/api/atleta'),
          axios.get('http://localhost:8080/api/clube'),
          axios.get('http://localhost:8080/api/estatistica')
        ]);

        const atletas = Array.isArray(atletasRes.data) ? atletasRes.data : [];
        const clubes = Array.isArray(clubesRes.data) ? clubesRes.data : [];
        const estats = Array.isArray(estatRes.data) ? estatRes.data : [];

        // Calcular top goleador
        const top = estats.reduce((prev, current) => {
          return (prev.gols > current.gols) ? prev : current;
        }, { nomeAtleta: '---', gols: 0 });

        setStats({
          totalAtletas: atletas.length,
          totalClubes: clubes.length,
          topGoleador: top.nomeAtleta || '---',
          recentActivity: [
            ...atletas.slice(-3).map(a => ({ id: `a-${a.atletaId}`, type: 'atleta', name: `${a.nome} ${a.sobrenome}`, desc: `Novo atleta: ${a.posicao}`, time: 'Recentemente' })),
            ...clubes.slice(-2).map(c => ({ id: `c-${c.clubeId}`, type: 'clube', name: c.nome, desc: `Novo clube: ${c.pais}`, time: 'Recentemente' }))
          ]
        });
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

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
      value: stats.topGoleador, 
      icon: <Award className="w-6 h-6" />, 
      color: 'text-yellow-500',
      trend: 'Destaque'
    },
    { 
      title: 'Atividades Recentes', 
      value: stats.recentActivity.length, 
      icon: <Activity className="w-6 h-6" />, 
      color: 'text-brand-neon',
      trend: 'Atualizado'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Dashboard <span className="text-brand-primary">Overview</span></h2>
        <p className="text-brand-muted mt-1">Bem-vindo de volta! Aqui está o resumo do seu sistema.</p>
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
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">{card.title}</p>
                    <h3 className="text-3xl font-black text-white mt-2 group-hover:text-brand-primary transition-colors">{card.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-brand-dark border border-brand-border ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="neon" className="px-1.5 py-0.5 text-[10px]">{card.trend}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <Card title="Atividades Recentes" className="lg:col-span-2">
              <div className="space-y-6">
                {stats.recentActivity.length > 0 ? stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-brand-border ${
                        activity.type === 'atleta' ? 'text-brand-primary bg-brand-primary/10' : 'text-blue-500 bg-blue-500/10'
                      }`}>
                        {activity.type === 'atleta' ? <Users className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{activity.name}</p>
                        <p className="text-xs text-brand-muted">{activity.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-muted uppercase">{activity.time}</span>
                  </div>
                )) : (
                  <p className="text-center py-8 text-brand-muted italic">Nenhuma atividade recente encontrada.</p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Ações Rápidas">
              <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center gap-3 p-3 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group">
                  <PlusCircle className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
                  Novo Atleta
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group">
                  <Shield className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  Novo Clube
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group">
                  <BarChart2 className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                  Ver Rankings
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl bg-brand-dark border border-brand-border hover:border-brand-primary/50 text-white transition-all text-sm font-bold group">
                  <TrendingUp className="w-5 h-5 text-brand-neon group-hover:scale-110 transition-transform" />
                  Estatísticas
                </button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

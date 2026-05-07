import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, User } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Input';
import Badge from '../ui/Badge';

export default function EditarAtleta() {
  const [atleta, setAtleta] = useState({
    nome: '',
    sobrenome: '',
    posicao: '',
    nacionalidade: '',
    clubeId: ''
  });
  const [posicoes, setPosicoes] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const idAtleta = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (!idAtleta) {
      navigate('/menu-atleta/gerenciar');
      return;
    }

    async function carregarDados() {
      setLoading(true);
      try {
        const [atletaRes, clubesRes, posicoesRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/atleta/${idAtleta}`),
          axios.get('http://localhost:8080/api/clube'),
          axios.get('http://localhost:8080/api/enums/posicoes')
        ]);

        setAtleta(atletaRes.data);
        setClubes(Array.isArray(clubesRes.data) ? clubesRes.data : []);
        
        const formatadas = (Array.isArray(posicoesRes.data) ? posicoesRes.data : []).map((item) => {
          if (typeof item === 'string') return { value: item, label: item };
          const sigla = item.sigla || item.name || item.value || '';
          const descricao = item.descricao || item.nome || item.label || '';
          return { value: sigla, label: `[${sigla}] ${descricao}` };
        });
        setPosicoes(formatadas);
      } catch (err) {
        setMensagem('Erro ao carregar dados do atleta.');
        setErro(true);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [idAtleta, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await axios.put(`http://localhost:8080/api/atleta/atualizar/${idAtleta}`, atleta);
      setMensagem('Atleta atualizado com sucesso!');
      setErro(false);
      setTimeout(() => navigate('/menu-atleta/gerenciar'), 1500);
    } catch (err) {
      setMensagem('Erro ao atualizar atleta.');
      setErro(true);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/menu-atleta/gerenciar')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-white">Editar Atleta</h2>
            <p className="text-brand-muted">Atualize as informações de {atleta.nome}.</p>
          </div>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg animate-in slide-in-from-top duration-300 ${erro ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 flex flex-col items-center text-center py-10">
          <div className="w-24 h-24 rounded-full bg-brand-border flex items-center justify-center text-3xl font-bold text-brand-primary border-4 border-brand-dark shadow-xl mb-4">
            {atleta.nome?.charAt(0)}{atleta.sobrenome?.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-white">{atleta.nome} {atleta.sobrenome}</h3>
          <p className="text-sm text-brand-muted mb-6">{atleta.clubeNome || 'Sem Clube'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="neon">{atleta.posicao}</Badge>
            <Badge>{atleta.nacionalidade}</Badge>
          </div>
        </Card>

        <Card title="Informações Pessoais" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={atleta.nome}
                onChange={(e) => setAtleta({ ...atleta, nome: e.target.value })}
              />
              <Input
                label="Sobrenome"
                value={atleta.sobrenome}
                onChange={(e) => setAtleta({ ...atleta, sobrenome: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Posição"
                value={atleta.posicao}
                onChange={(e) => setAtleta({ ...atleta, posicao: e.target.value })}
                options={posicoes}
              />
              <Input
                label="Nacionalidade"
                value={atleta.nacionalidade}
                onChange={(e) => setAtleta({ ...atleta, nacionalidade: e.target.value })}
              />
            </div>

            <Select
              label="Clube"
              value={atleta.clubeId || ''}
              onChange={(e) => setAtleta({ ...atleta, clubeId: e.target.value })}
              options={[
                { value: '', label: 'Sem Clube' },
                ...clubes.map(c => ({ value: c.clubeId, label: c.nome }))
              ]}
            />

            <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate('/menu-atleta/gerenciar')} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando} className="gap-2">
                <Save className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

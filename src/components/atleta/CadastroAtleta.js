import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Save, Trash2, Users, User } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Input';
import Badge from '../ui/Badge';

export default function CadastroAtletaEmLote() {
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState('');
  const [posicoes, setPosicoes] = useState([]);
  const [clubeId, setClubeId] = useState('');
  const [clubes, setClubes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [atletasParaCadastrar, setAtletasParaCadastrar] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDados() {
      try {
        const [clubesRes, posicoesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/clube'),
          axios.get('http://localhost:8080/api/enums/posicoes')
        ]);
        
        setClubes(Array.isArray(clubesRes.data) ? clubesRes.data : []);
        
        const formatadas = (Array.isArray(posicoesRes.data) ? posicoesRes.data : []).map((item) => {
          if (typeof item === 'string') return { value: item, label: item };
          const sigla = item.sigla || item.name || item.value || '';
          const descricao = item.descricao || item.nome || item.label || '';
          return { value: sigla, label: `[${sigla}] ${descricao}` };
        });
        setPosicoes(formatadas);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
    carregarDados();
  }, []);

  const capitalizarNome = (texto) => {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  const adicionarAtletaNaLista = (e) => {
    e.preventDefault();
    if (!nome.trim() || !posicao) {
      setMensagem('Nome e posição são obrigatórios.');
      setErro(true);
      return;
    }

    const clubeSelecionado = clubes.find(c => c.clubeId === parseInt(clubeId));
    const novoAtleta = {
      nome: capitalizarNome(nome.trim()),
      posicao,
      clubeId: clubeId ? parseInt(clubeId) : null,
      clubeNome: clubeSelecionado?.nome || 'Sem Clube',
    };

    setAtletasParaCadastrar((prev) => [...prev, novoAtleta]);
    setNome('');
    setPosicao('');
    setClubeId('');
    setMensagem('');
    setErro(false);
  };

  const removerDaLista = (index) => {
    setAtletasParaCadastrar(prev => prev.filter((_, i) => i !== index));
  };

  const cadastrarTodos = async () => {
    if (atletasParaCadastrar.length === 0) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/atleta/adicionar-em-lote', atletasParaCadastrar);
      setMensagem('Atletas cadastrados com sucesso! Redirecionando...');
      setErro(false);
      setAtletasParaCadastrar([]);
      
      // Delay menor para navegação
      setTimeout(() => {
        navigate('/menu-atleta/gerenciar');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar os atletas.';
      setMensagem(msg);
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">Cadastrar Atletas</h2>
          <p className="text-brand-muted mt-1">Gerencie a fila de atletas para cadastro em massa.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/menu-atleta/gerenciar')}>
          Ver Todos os Atletas
        </Button>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg animate-in slide-in-from-top duration-300 ${erro ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Card */}
        <Card title="Novo Atleta" className="lg:col-span-2">
          <form onSubmit={adicionarAtletaNaLista} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Ex: Cristiano Ronaldo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Select
              label="Posição"
              value={posicao}
              onChange={(e) => setPosicao(e.target.value)}
              options={[{ value: '', label: 'Selecione a posição' }, ...posicoes]}
            />
            <Select
              label="Clube (Opcional)"
              value={clubeId}
              onChange={(e) => setClubeId(e.target.value)}
              options={[{ value: '', label: 'Sem Clube' }, ...clubes.map(c => ({ value: c.clubeId, label: c.nome }))]}
            />
            <Button type="submit" className="w-full mt-4 gap-2">
              <Plus className="w-4 h-4" /> Adicionar à Fila
            </Button>
          </form>
        </Card>

        {/* List Card */}
        <Card 
          title="Fila de Atletas" 
          subtitle={`${atletasParaCadastrar.length} atletas prontos`}
          className="lg:col-span-3"
          headerAction={atletasParaCadastrar.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setAtletasParaCadastrar([])} className="text-red-500">
              Limpar Tudo
            </Button>
          )}
        >
          {atletasParaCadastrar.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {atletasParaCadastrar.map((atleta, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-brand-dark rounded-xl border border-brand-border group hover:border-brand-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-border flex items-center justify-center text-brand-primary font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-brand-primary transition-colors">{atleta.nome}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="neon" className="py-0">{atleta.posicao}</Badge>
                          <Badge className="py-0">{atleta.clubeNome}</Badge>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removerDaLista(index)}
                      className="text-brand-muted hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={cadastrarTodos} 
                className="w-full mt-4 gap-2 h-14 text-lg font-black" 
                disabled={loading}
              >
                {loading ? 'Processando...' : <><Save className="w-5 h-5" /> Finalizar Cadastro em Lote</>}
              </Button>
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-brand-border rounded-2xl">
              <Users className="mx-auto text-6xl text-brand-muted mb-4 opacity-10" />
              <p className="text-brand-muted font-medium">Sua fila de cadastro está vazia.</p>
              <p className="text-brand-muted text-xs mt-1">Use o formulário ao lado para adicionar atletas.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Save, Trash2, Shield } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import Badge from '../ui/Badge';

export default function CadastroClubeEmLote() {
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [pais, setPais] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [clubesParaCadastrar, setClubesParaCadastrar] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const adicionarClubeNaLista = (e) => {
    e.preventDefault();
    if (!nome.trim() || !sigla.trim() || !pais.trim()) {
      setMensagem('Todos os campos são obrigatórios.');
      setErro(true);
      return;
    }

    const novoClube = {
      nome: nome.trim(),
      sigla: sigla.trim().toUpperCase(),
      pais: pais.trim(),
    };

    setClubesParaCadastrar((prev) => [...prev, novoClube]);
    setNome('');
    setSigla('');
    setPais('');
    setMensagem('');
    setErro(false);
  };

  const removerDaLista = (index) => {
    setClubesParaCadastrar(prev => prev.filter((_, i) => i !== index));
  };

  const cadastrarTodos = async () => {
    if (clubesParaCadastrar.length === 0) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/clube/adicionar-em-lote', clubesParaCadastrar);
      setMensagem('Clubes cadastrados com sucesso!');
      setErro(false);
      setClubesParaCadastrar([]);
      setTimeout(() => navigate('/menu-clube/gerenciar'), 1500);
    } catch (err) {
      setMensagem('Erro ao cadastrar os clubes.');
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">Cadastrar Clubes</h2>
          <p className="text-brand-muted mt-1">Gerencie a fila de clubes para cadastro em massa.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/menu-clube/gerenciar')}>
          Ver Todos os Clubes
        </Button>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg animate-in slide-in-from-top duration-300 ${erro ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Card */}
        <Card title="Novo Clube" className="lg:col-span-2">
          <form onSubmit={adicionarClubeNaLista} className="space-y-4">
            <Input
              label="Nome do Clube"
              placeholder="Ex: Real Madrid"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sigla"
                placeholder="Ex: RMA"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                maxLength={3}
              />
              <Input
                label="País"
                placeholder="Ex: Espanha"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-4 gap-2">
              <Plus className="w-4 h-4" /> Adicionar à Fila
            </Button>
          </form>
        </Card>

        {/* List Card */}
        <Card 
          title="Fila de Clubes" 
          subtitle={`${clubesParaCadastrar.length} clubes prontos`}
          className="lg:col-span-3"
          headerAction={clubesParaCadastrar.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setClubesParaCadastrar([])} className="text-red-500">
              Limpar Tudo
            </Button>
          )}
        >
          {clubesParaCadastrar.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {clubesParaCadastrar.map((clube, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-brand-dark rounded-xl border border-brand-border group hover:border-brand-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-border flex items-center justify-center text-brand-primary font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-brand-primary transition-colors">{clube.nome}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="neon" className="py-0">{clube.sigla}</Badge>
                          <Badge className="py-0">{clube.pais}</Badge>
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
              <Shield className="mx-auto text-6xl text-brand-muted mb-4 opacity-10" />
              <p className="text-brand-muted font-medium">Sua fila de cadastro está vazia.</p>
              <p className="text-brand-muted text-xs mt-1">Use o formulário ao lado para adicionar clubes.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

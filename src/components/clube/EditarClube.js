import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Shield } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';

export default function EditarClube() {
  const [clube, setClube] = useState({
    nome: '',
    sigla: '',
    pais: ''
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const idClube = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (!idClube) {
      navigate('/menu-clube/gerenciar');
      return;
    }

    async function carregarClube() {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/clube/${idClube}`);
        setClube(res.data);
      } catch (err) {
        setMensagem('Erro ao carregar dados do clube.');
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    carregarClube();
  }, [idClube, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await axios.put(`http://localhost:8080/api/clube/atualizar/${idClube}`, clube);
      setMensagem('Clube atualizado com sucesso!');
      setErro(false);
      setTimeout(() => navigate('/menu-clube/gerenciar'), 1500);
    } catch (err) {
      setMensagem('Erro ao atualizar clube.');
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/menu-clube/gerenciar')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-white">Editar Clube</h2>
            <p className="text-brand-muted">Atualize as informações do {clube.nome}.</p>
          </div>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg animate-in slide-in-from-top duration-300 ${erro ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 rounded-2xl bg-brand-dark border border-brand-border flex items-center justify-center text-brand-primary mb-4 shadow-xl">
            <Shield className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{clube.sigla || '---'}</h3>
          <p className="text-brand-muted text-sm">{clube.pais}</p>
        </Card>

        <Card title="Dados do Clube" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Clube"
              value={clube.nome}
              onChange={(e) => setClube({ ...clube, nome: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sigla"
                value={clube.sigla}
                onChange={(e) => setClube({ ...clube, sigla: e.target.value.toUpperCase() })}
                maxLength={3}
              />
              <Input
                label="País"
                value={clube.pais}
                onChange={(e) => setClube({ ...clube, pais: e.target.value })}
              />
            </div>

            <div className="pt-6 border-t border-brand-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate('/menu-clube/gerenciar')} type="button">
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

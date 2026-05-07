import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Plus, Search, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Input';
import Badge from '../ui/Badge';

export default function GerenciarClube() {
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPais, setFiltroPais] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    buscarClubes();
  }, []);

  const buscarClubes = async () => {
    setLoading(true);
    try {
      const resposta = await axios.get('http://localhost:8080/api/clube');
      setClubes(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (err) {
      setMensagem('Erro ao buscar clubes.');
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  const deletarClube = async (clube) => {
    if (!clube) return;
    const confirmacao = window.confirm(`Deseja deletar o clube "${clube.nome}"?`);
    if (!confirmacao) return;

    try {
      await axios.delete(`http://localhost:8080/api/clube/deletar/${clube.clubeId}`);
      setMensagem(`Clube "${clube.nome}" deletado com sucesso!`);
      setErro(false);
      buscarClubes();
    } catch (err) {
      setMensagem('Erro ao deletar o clube.');
      setErro(true);
    }
  };

  const paisesUnicos = [...new Set(clubes.map(c => c.pais).filter(Boolean))];

  const clubesFiltrados = clubes.filter(c => 
    (c.nome || '').toLowerCase().includes(filtroNome.toLowerCase()) &&
    (filtroPais === '' || c.pais === filtroPais)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Clubes</h2>
          <p className="text-brand-muted text-sm">Visualize e administre os clubes cadastrados.</p>
        </div>
        <Button onClick={() => navigate('/menu-clube/cadastrar')} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Clube
        </Button>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg flex items-center justify-between animate-in slide-in-from-top duration-300 ${erro ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'}`}>
          <span>{mensagem}</span>
          <button onClick={() => setMensagem('')} className="text-sm font-bold opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Input 
            label="Buscar por nome" 
            placeholder="Ex: Real Madrid" 
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Select 
            label="País" 
            value={filtroPais}
            onChange={(e) => setFiltroPais(e.target.value)}
            options={[
              { value: '', label: 'Todos os Países' },
              ...paisesUnicos.map(p => ({ value: p, label: p }))
            ]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-xs uppercase tracking-wider">
                  <th className="px-4 py-4 font-semibold">Clube</th>
                  <th className="px-4 py-4 font-semibold">Sigla</th>
                  <th className="px-4 py-4 font-semibold">País</th>
                  <th className="px-4 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {clubesFiltrados.map((clube) => (
                  <tr key={clube.clubeId} className="group hover:bg-brand-dark/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-white group-hover:text-brand-primary transition-colors">{clube.nome}</td>
                    <td className="px-4 py-4">
                      <Badge variant="default">{clube.sigla}</Badge>
                    </td>
                    <td className="px-4 py-4 text-brand-muted text-sm">{clube.pais}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/menu-clube/gerenciar/editar?id=${clube.clubeId}`)}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-500/10"
                          onClick={() => deletarClube(clube)}
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

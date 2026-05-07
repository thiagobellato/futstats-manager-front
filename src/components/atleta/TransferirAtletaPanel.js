import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '../ui/Button';
import { Select } from '../ui/Input';

export default function TransferirAtletaPanel({ atleta, onCancel, onTransferenciaFeita }) {
  const [clubes, setClubes] = useState([]);
  const [clubeSelecionado, setClubeSelecionado] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/clube').then(res => {
      setClubes(res.data.filter(c => c.clubeId !== atleta.clubeId));
    });
  }, [atleta]);

  const handleTransferir = () => {
    if (!clubeSelecionado) return;
    setLoading(true);

    axios.post(`http://localhost:8080/api/atleta/${atleta.atletaId}/transferir`, {
      novoClubeId: clubeSelecionado
    }).then(() => {
      onTransferenciaFeita("Atleta transferido com sucesso!", false);
      onCancel();
    }).catch((err) => {
      const msg = err.response?.data?.message || err.message;
      onTransferenciaFeita("Erro ao transferir atleta: " + msg, true);
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="p-6 bg-brand-dark rounded-xl border border-brand-border shadow-inner">
      <h3 className="mb-4 font-bold text-white flex items-center gap-2">
        Transferir <span className="text-brand-primary">{atleta.nome} {atleta.sobrenome}</span>
      </h3>
      
      <div className="space-y-4">
        <Select
          label="Novo Clube"
          value={clubeSelecionado}
          onChange={e => setClubeSelecionado(e.target.value)}
          options={[
            { value: '', label: 'Selecione o novo clube' },
            ...clubes.map(clube => ({ value: clube.clubeId, label: clube.nome }))
          ]}
        />

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleTransferir}
            disabled={!clubeSelecionado || loading}
            className="flex-1"
          >
            {loading ? 'Transferindo...' : 'Confirmar Transferência'}
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransferirAtletaModal({ atleta, onClose, onTransferenciaFeita }) {
  const [clubes, setClubes] = useState([]);
  const [clubeSelecionado, setClubeSelecionado] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/clube').then(res => {
      setClubes(res.data.filter(c => c.clubeId !== atleta.clubeId));
    });
  }, [atleta]);

  const handleTransferir = () => {
    if (!clubeSelecionado) return;

    axios.post(`http://localhost:8080/api/atleta/${atleta.atletaId}/transferir`, {
      novoClubeId: clubeSelecionado
    }).then(() => {
      onTransferenciaFeita("Atleta transferido com sucesso!", false); // verde
      onClose();
    }).catch((err) => {
      const msg = err.response?.data?.message || err.message;
      onTransferenciaFeita("Erro ao transferir atleta: " + msg, true); // vermelho
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Transferir {atleta.nome} {atleta.sobrenome}</h3>
        <select value={clubeSelecionado} onChange={e => setClubeSelecionado(e.target.value)}>
          <option value="">Selecione o novo clube</option>
          {clubes.map(clube => (
            <option key={clube.clubeId} value={clube.clubeId}>
              {clube.nome}
            </option>
          ))}
        </select>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleTransferir} disabled={!clubeSelecionado}>Transferir</button>
          <button onClick={onClose} style={{ marginLeft: '1rem' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

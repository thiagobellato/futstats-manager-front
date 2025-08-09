import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransferirAtletaPanel({ atleta, onCancel, onTransferenciaFeita }) {
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
      onTransferenciaFeita("Atleta transferido com sucesso!", false); // mensagem sucesso
      onCancel(); // fecha o painel
    }).catch((err) => {
      const msg = err.response?.data?.message || err.message;
      onTransferenciaFeita("Erro ao transferir atleta: " + msg, true); // mensagem erro
    });
  };

  return (
    <div className="p-4 mt-2 rounded-lg bg-primaryPurple border border-primaryGreen text-white shadow-md">
      <h3 className="mb-2 font-semibold text-lg">
        Transferir {atleta.nome} {atleta.sobrenome}
      </h3>
      <select
        value={clubeSelecionado}
        onChange={e => setClubeSelecionado(e.target.value)}
        className="form-input"
      >
        <option value="">Selecione o novo clube</option>
        {clubes.map(clube => (
          <option key={clube.clubeId} value={clube.clubeId}>
            {clube.nome}
          </option>
        ))}
      </select>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleTransferir}
          disabled={!clubeSelecionado}
          className={`form-button ${!clubeSelecionado ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Transferir
        </button>
        <button
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

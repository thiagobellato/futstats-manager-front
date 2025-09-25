import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import BotaoVoltar from '../BotaoVoltar';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function GerenciarClube() {
  const [clubes, setClubes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [filtroPais, setFiltroPais] = useState('');
  const [filtroNome, setFiltroNome] = useState('');

  const navigate = useNavigate();
  const { fecharBarra } = useOutletContext();

  useEffect(() => {
    buscarClubes();
  }, []);

  const buscarClubes = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/clube');
      setClubes(resposta.data);
    } catch (err) {
      setMensagem('Erro ao buscar clubes.');
      setErro(true);
    }
  };

  const deletarClube = async (clube) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja deletar o clube "${clube.nome}"?`
    );
    if (!confirmacao) {
      setMensagem(`Operação cancelada para o clube "${clube.nome}".`);
      setErro(true);
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/clube/deletar/${clube.clubeId}`);
      setMensagem(`Clube "${clube.nome}" deletado com sucesso!`);
      setErro(false);
      buscarClubes();
    } catch (err) {
      setMensagem(`Erro ao deletar o clube "${clube.nome}".`);
      setErro(true);
    }
  };

  const irParaEditar = (id) => {
    navigate(`/menu-clube/gerenciar/editar?id=${id}`);
  };

  const handleVoltar = () => {
    fecharBarra();
    setFiltroNome('');
    setFiltroPais('');
    setMensagem('');
    setErro(false);
  };

  const paisesUnicos = [...new Set(clubes.map((c) => c.pais))];

  const clubesFiltrados = clubes.filter((clube) => {
    const atendePais = filtroPais ? clube.pais === filtroPais : true;
    const atendeNome = filtroNome
      ? clube.nome.toLowerCase().startsWith(filtroNome.toLowerCase())
      : true;
    return atendePais && atendeNome;
  });

  return (
    <div className="form-background">
      <div className="form-card" style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>

        <div className="flex items-center mb-6">
          <BotaoVoltar onClick={handleVoltar} />
          <h2 className="form-title">Gerenciar Clubes</h2>
        </div>

        {mensagem && (
          <div className={`mensagem ${erro ? 'erro' : 'sucesso'}`}>
            {mensagem}
          </div>
        )}

        {/* Filtros */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ color: 'white', display: 'block' }}>
            País:{' '}
            <select
              value={filtroPais}
              onChange={(e) => setFiltroPais(e.target.value)}
              className="filtro-select"
            >
              <option value="">Todos</option>
              {paisesUnicos.map((pais) => (
                <option key={pais} value={pais}>
                  {pais}
                </option>
              ))}
            </select>
          </label>

          <label style={{ color: 'white', display: 'block' }}>
            Nome:{' '}
            <input
              type="text"
              placeholder="Início do nome"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="filtro-input"
            />
          </label>
        </div>

        {/* Lista de clubes */}
        <ul className="lista-clubes">
          {clubesFiltrados.length > 0 ? (
            clubesFiltrados.map((clube) => (
              <li
                key={clube.clubeId}
                className="item-clube"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #ccc',
                  color: 'white',
                }}
              >
                <span>
                  {clube.nome} ({clube.sigla} - {clube.pais})
                </span>
                <div className="acoes" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    title="Editar"
                    onClick={() => irParaEditar(clube.clubeId)}
                    aria-label={`Editar clube ${clube.nome}`}
                    className="btn-icon btn-edit"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    title="Deletar"
                    onClick={() => deletarClube(clube)}
                    aria-label={`Deletar clube ${clube.nome}`}
                    className="btn-icon btn-delete"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li style={{ color: 'white' }}>Nenhum clube encontrado com esses filtros.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

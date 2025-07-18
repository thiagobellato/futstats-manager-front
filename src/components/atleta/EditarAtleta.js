// src/components/atleta/EditarAtleta.js
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function EditarAtleta() {
  const [atleta, setAtleta] = useState(null);
  const [clubes, setClubes] = useState([]);
  const [posicoes, setPosicoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  useEffect(() => {
    if (id) carregarDados(id);
    carregarClubes();
    carregarPosicoes();
  }, [id]);

  const carregarDados = async (id) => {
    try {
      const resposta = await axios.get(`http://localhost:8080/api/atleta/${id}`);
      const data = resposta.data;

      setAtleta({
        atletaId: data.atletaId,
        nome: data.nome || '',
        sobrenome: data.sobrenome || '',
        dataDeNascimento: data.dataDeNascimento?.substring(0, 10) || '',
        nacionalidade: data.nacionalidade || '',
        posicao: data.posicao || '',
        clubeId: data.clubeId || '',
      });
    } catch (err) {
      console.error('Erro ao carregar atleta:', err);
      setMensagem('Erro ao carregar atleta.');
      setErro(true);
    }
  };

  const carregarClubes = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/clube');
      setClubes(resposta.data);
    } catch (err) {
      console.error('Erro ao carregar clubes:', err);
    }
  };

  const carregarPosicoes = async () => {
    try {
      const resposta = await axios.get('http://localhost:8080/api/enums/posicoes');
      setPosicoes(resposta.data);
    } catch (err) {
      console.error('Erro ao carregar posições:', err);
    }
  };

  const atualizar = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nome: atleta.nome || null,
        sobrenome: atleta.sobrenome || null,
        dataDeNascimento: atleta.dataDeNascimento || null,
        nacionalidade: atleta.nacionalidade || null,
        posicao: atleta.posicao || null,
        clubeId: atleta.clubeId || null,
      };

      await axios.put(`http://localhost:8080/api/atleta/atualizar/${id}`, payload);

      setMensagem('Atleta atualizado com sucesso!');
      setErro(false);

      setTimeout(() => navigate('/menu-atleta/gerenciar'), 1000);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao atualizar atleta.');
      setErro(true);
    }
  };

  if (!atleta) return <div>Carregando atleta...</div>;

  return (
    <div className="form-card">
      {/* Setinha circular para voltar */}
      <div
        className="botao-voltar-circular"
        title="Voltar para Gerenciar Atletas"
        onClick={() => navigate('/menu-atleta/gerenciar')}
        style={{ marginBottom: '20px', cursor: 'pointer' }}
      >
        ←
      </div>

      <h2>Editar Atleta</h2>
      <form onSubmit={atualizar}>
        <input
          type="text"
          placeholder="Nome"
          value={atleta.nome}
          onChange={(e) => setAtleta({ ...atleta, nome: e.target.value })}
        />

        <input
          type="text"
          placeholder="Sobrenome"
          value={atleta.sobrenome}
          onChange={(e) => setAtleta({ ...atleta, sobrenome: e.target.value })}
        />

        <input
          type="date"
          value={atleta.dataDeNascimento}
          onChange={(e) => setAtleta({ ...atleta, dataDeNascimento: e.target.value })}
        />

        <input
          type="text"
          placeholder="Nacionalidade"
          value={atleta.nacionalidade}
          onChange={(e) => setAtleta({ ...atleta, nacionalidade: e.target.value })}
        />

        <select
          value={atleta.posicao}
          onChange={(e) => setAtleta({ ...atleta, posicao: e.target.value })}
        >
          <option value="">-- Selecione a Posição --</option>
          {posicoes.map((p) => (
            <option key={p.sigla} value={p.sigla}>
              [{p.sigla}] {p.descricao}
            </option>
          ))}
        </select>

        <select
          value={atleta.clubeId}
          onChange={(e) => setAtleta({ ...atleta, clubeId: parseInt(e.target.value) })}
        >
          <option value="">-- Selecione o Clube --</option>
          {clubes.map((c) => (
            <option key={c.clubeId} value={c.clubeId}>
              {c.nome}
            </option>
          ))}
        </select>

        <button type="submit">Atualizar</button>
      </form>

      {mensagem && (
        <div className={`mensagem ${erro ? 'erro' : 'sucesso'}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
}

// src/components/atleta/EditarAtleta.js
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';


export default function EditarAtleta() {
  const [atleta, setAtleta] = useState(null);
  const [posicoes, setPosicoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  useEffect(() => {
    if (id) carregarDados(id);
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
        clube: data.clubeNome || 'Não informado',
      });
    } catch (err) {
      console.error('Erro ao carregar atleta:', err);
      setMensagem('Erro ao carregar atleta.');
      setErro(true);
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

  if (!atleta) {
    return (
      <div className="text-center mt-10 text-white">
        Carregando atleta...
      </div>
    );
  }

  return (
    <div className="form-background">
      <div className="form-container">
        <button
          onClick={() => navigate('/menu-atleta/gerenciar')}
          className="mb-4 flex items-center text-[var(--primaryGreen)] hover:text-[var(--lightGreen)]"
          title="Voltar"
        >
          <ArrowLeft className="mr-2" /> Voltar para Gerenciar Atletas
        </button>

        <h2 className="form-title">Editar Atleta</h2>

        <form onSubmit={atualizar}>
          <input
            type="text"
            placeholder="Nome"
            value={atleta.nome}
            onChange={(e) => setAtleta({ ...atleta, nome: e.target.value })}
            className="form-input"
          />

          <input
            type="text"
            placeholder="Sobrenome"
            value={atleta.sobrenome}
            onChange={(e) => setAtleta({ ...atleta, sobrenome: e.target.value })}
            className="form-input"
          />

          <input
            type="date"
            value={atleta.dataDeNascimento}
            onChange={(e) => setAtleta({ ...atleta, dataDeNascimento: e.target.value })}
            className="form-input"
          />

          <input
            type="text"
            placeholder="Nacionalidade"
            value={atleta.nacionalidade}
            onChange={(e) => setAtleta({ ...atleta, nacionalidade: e.target.value })}
            className="form-input"
          />

          <select
            value={atleta.posicao}
            onChange={(e) => setAtleta({ ...atleta, posicao: e.target.value })}
            className="form-input"
          >
            <option value="">-- Selecione a Posição --</option>
            {posicoes.map((p) => (
              <option key={p.sigla} value={p.sigla}>
                [{p.sigla}] {p.descricao}
              </option>
            ))}
          </select>

          <div>
            <label className="text-sm text-[var(--primaryPurple)] font-bold">
              Clube Atual
            </label>
            <div className="form-input bg-gray-200 cursor-not-allowed text-gray-700 mt-1">
              {atleta.clube}
            </div>
          </div>

          <button type="submit" className="form-button mt-4">
            Atualizar
          </button>
        </form>

        {mensagem && (
          <div
            className={`mt-4 text-center font-medium p-2 rounded ${
              erro ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
            }`}
          >
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
}

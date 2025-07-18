// src/components/clube/EditarClube.js
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function EditarClube() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [nome, setNome] = useState('');
  const [pais, setPais] = useState('');
  const [sigla, setSigla] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function buscarClube() {
      if (!id) return;

      try {
        const resposta = await axios.get(`http://localhost:8080/api/clube/${id}`);
        const clube = resposta.data;

        setNome(clube.nome || '');
        setPais(clube.pais || '');
        setSigla(clube.sigla || '');
        setMensagem('');
        setErro(false);
      } catch (err) {
        console.error('Erro ao carregar clube', err);
        setMensagem('Erro ao carregar informações do clube.');
        setErro(true);
      }
    }

    buscarClube();
  }, [id]);

  const atualizar = async (e) => {
    e.preventDefault();

    if (!id) {
      setMensagem('ID do clube não encontrado.');
      setErro(true);
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/clube/atualizar/${id}`, {
        nome,
        pais,
        sigla,
      });

      setMensagem('Clube atualizado com sucesso!');
      setErro(false);

      setTimeout(() => {
        navigate('/menu-clube/gerenciar');
      }, 1200);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao atualizar clube.');
      setErro(true);
    }
  };

  return (
    <div className="form-card">
      {/* Botão de voltar circular */}
      <div
        className="botao-voltar-circular"
        title="Voltar para Gerenciar Clubes"
        onClick={() => navigate('/menu-clube/gerenciar')}
        style={{ marginBottom: '20px', cursor: 'pointer' }}
      >
        ←
      </div>

      <h2>Editar Clube</h2>

      <form onSubmit={atualizar}>
        <input
          type="text"
          placeholder="Nome do Clube"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="País"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Sigla"
          value={sigla}
          onChange={(e) => setSigla(e.target.value)}
          required
        />
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

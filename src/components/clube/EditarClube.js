import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';

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
    <div className="form-background">
      <div className="form-container">
        <button
          onClick={() => navigate('/menu-clube/gerenciar')}
          className="mb-4 flex items-center text-[var(--primaryGreen)] hover:text-[var(--lightGreen)]"
          title="Voltar para Gerenciar Clubes"
          aria-label="Voltar para Gerenciar Clubes"
          type="button"
        >
          <ArrowLeft className="mr-2" /> Voltar para Gerenciar Clubes
        </button>

        <h2 className="form-title">Editar Clube</h2>

        <form onSubmit={atualizar}>
          <input
            type="text"
            placeholder="Nome do Clube"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-input"
            required
          />

          <input
            type="text"
            placeholder="País"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="form-input"
            required
          />

          <input
            type="text"
            placeholder="Sigla"
            value={sigla}
            onChange={(e) => setSigla(e.target.value)}
            className="form-input"
            required
          />

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

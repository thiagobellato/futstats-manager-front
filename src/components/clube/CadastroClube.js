import axios from 'axios';
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import BotaoVoltar from '../BotaoVoltar';

export default function CadastroClubeEmLote() {
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [pais, setPais] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [clubesParaCadastrar, setClubesParaCadastrar] = useState([]);
  const { fecharBarra } = useOutletContext();

  const navigate = useNavigate();


  const limparTudo = () => {
    setNome('');
    setSigla('');
    setPais('');
    setMensagem('');
    setErro(false);
    setClubesParaCadastrar([]);
  };


  const adicionarClubeNaLista = (e) => {
    e.preventDefault();

    if (!nome.trim() || !sigla.trim() || !pais.trim()) {
      setMensagem('Preencha todos os campos antes de adicionar à lista.');
      setErro(true);
      return;
    }

    const novoClube = {
      nome: nome.trim(),
      sigla: sigla.trim(),
      pais: pais.trim(),
    };

    setClubesParaCadastrar((prev) => [...prev, novoClube]);
    setNome('');
    setSigla('');
    setPais('');
    setMensagem('');
    setErro(false);
  };

  const cadastrarTodos = async () => {
    if (clubesParaCadastrar.length === 0) {
      setMensagem('Adicione pelo menos um clube antes de cadastrar.');
      setErro(true);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/clube/adicionar-em-lote', clubesParaCadastrar);
      setMensagem('Todos os clubes foram cadastrados com sucesso!');
      setErro(false);
      limparTudo();

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao cadastrar os clubes.');
      setErro(true);
    }
  };

  const handleVoltar = () => {
    limparTudo();
    fecharBarra(null);
    navigate('/');
  };

  return (
    <div className="form-background min-h-screen flex items-center justify-center p-6">
      <div className="form-container max-w-md w-full p-8 rounded-2xl shadow-lg bg-gradient-to-r from-primaryPurple to-primaryGreen text-white">
        <div className="flex items-center mb-6">
          <BotaoVoltar onClick={handleVoltar} />
          <h2 className="form-title">Cadastro de Clubes</h2>
        </div>
  

        <form onSubmit={adicionarClubeNaLista} className="flex flex-col">
          <input
            type="text"
            placeholder="Nome do Clube"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-input mb-4"
          />
          <input
            type="text"
            placeholder="Sigla"
            value={sigla}
            onChange={(e) => setSigla(e.target.value)}
            className="form-input mb-4"
          />
          <input
            type="text"
            placeholder="País"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="form-input mb-6"
          />
          <button
            type="submit"
            className="form-button w-full mb-6"
          >
            Adicionar à Lista
          </button>
        </form>

        {clubesParaCadastrar.length > 0 && (
          <section className="mb-6">
            <h3 className="text-white font-semibold mb-3">Clubes na fila para cadastro:</h3>
            <ul className="lista-clubes max-h-48 overflow-y-auto bg-primaryPurple p-3 rounded">
              {clubesParaCadastrar.map((clube, index) => (
                <li key={index} className="item-clube">
                  {clube.nome} ({clube.sigla}, {clube.pais})
                </li>
              ))}
            </ul>
            <button
              onClick={cadastrarTodos}
              className="form-button w-full mt-4"
            >
              Cadastrar Todos
            </button>
          </section>
        )}

        {mensagem && (
          <div
            className={`mt-4 text-center font-medium p-2 rounded ${erro ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
              }`}
            role="alert"
            aria-live="polite"
          >
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
}

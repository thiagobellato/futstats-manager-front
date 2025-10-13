import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import BotaoVoltar from '../BotaoVoltar';

export default function CadastroAtletaEmLote() {
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState('');
  const [posicoes, setPosicoes] = useState([]);
  const [clubeId, setClubeId] = useState('');
  const [clubes, setClubes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [atletasParaCadastrar, setAtletasParaCadastrar] = useState([]);
  const { fecharBarra } = useOutletContext();

  const navigate = useNavigate();

  const limparTudo = () => {
    setNome('');
    setPosicao('');
    setClubeId('');
    setAtletasParaCadastrar([]);
    setMensagem('');
    setErro(false);
  };

  const handleVoltar = () => {
    limparTudo();
    fecharBarra(null);
    navigate('/');
  };

  useEffect(() => {
    let mounted = true;

    async function carregarClubes() {
      try {
        const resposta = await axios.get('http://localhost:8080/api/clube');
        if (mounted) setClubes(resposta.data || []);
      } catch (err) {
        console.error('Erro ao carregar clubes:', err);
        if (mounted) setClubes([]);
      }
    }

    async function carregarPosicoes() {
      try {
        const resposta = await axios.get('http://localhost:8080/api/enums/posicoes');
        const data = resposta.data || [];

        const formatadas = data.map((item) => {
          if (typeof item === 'string') {
            const label = `[${item}] ${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}`;
            return { value: item, label };
          }
          if (item && typeof item === 'object') {
            const sigla = item.sigla || item.name || item.value || '';
            const nome = item.descricao || item.nome || item.label || '';
            return { value: sigla, label: `[${sigla}] ${nome}` };
          }
          return { value: String(item), label: String(item) };
        });

        if (mounted) setPosicoes(formatadas);
      } catch (err) {
        console.error('Erro ao carregar posições:', err);
        if (mounted) setPosicoes([]);
      }
    }

    carregarClubes();
    carregarPosicoes();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔤 Função Capitalizer para nomes de atletas
  const capitalizarNome = (texto) => {
    return texto
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  const adicionarAtletaNaLista = (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setMensagem('O nome do atleta é obrigatório.');
      setErro(true);
      return;
    }

    if (!posicao) {
      setMensagem('A posição do atleta é obrigatória.');
      setErro(true);
      return;
    }

    const clubeSelecionado = clubes.find(c => c.clubeId === parseInt(clubeId));

    const novoAtleta = {
      nome: capitalizarNome(nome.trim()),
      posicao,
      clubeId: clubeId ? parseInt(clubeId) : null,
      clubeNome: clubeSelecionado?.nome || 'Sem Clube',
    };

    setAtletasParaCadastrar((prev) => [...prev, novoAtleta]);
    setNome('');
    setPosicao('');
    setClubeId('');
    setMensagem('');
    setErro(false);
  };

  const cadastrarTodos = async () => {
    if (atletasParaCadastrar.length === 0) {
      setMensagem('Adicione pelo menos um atleta antes de cadastrar.');
      setErro(true);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/atleta/adicionar-em-lote', atletasParaCadastrar);
      setMensagem('Todos os atletas foram cadastrados com sucesso!');
      setErro(false);
      limparTudo();

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao cadastrar os atletas.');
      setErro(true);
    }
  };

  return (
    <div className="form-background min-h-screen flex items-center justify-center p-6">
      <div className="form-container max-w-md w-full p-8 rounded-2xl shadow-lg bg-gradient-to-r from-primaryPurple to-primaryGreen text-white">
        
        <div className="flex items-center mb-6">
          <BotaoVoltar onClick={handleVoltar} />
          <h2 className="form-title">Cadastro de Atletas</h2>
        </div>

        <form onSubmit={adicionarAtletaNaLista} className="flex flex-col">
          <input
            type="text"
            placeholder="Nome do Atleta"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-input mb-4"
            required
          />

          {/* 🔽 Campo de posição vindo do enum do back-end */}
          <select
            value={posicao}
            onChange={(e) => setPosicao(e.target.value)}
            className="form-input mb-4"
            required
          >
            <option value="">-- Selecione a Posição --</option>
            {posicoes.map((p, index) => (
              <option key={index} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={clubeId}
            onChange={(e) => setClubeId(e.target.value)}
            className="form-input mb-6"
          >
            <option value="">-- Sem Clube --</option>
            {clubes.map((clube) => (
              <option key={clube.clubeId} value={clube.clubeId}>
                {clube.nome}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="form-button w-full mb-6"
          >
            Adicionar à Lista
          </button>
        </form>

        {atletasParaCadastrar.length > 0 && (
          <section className="mb-6">
            <h3 className="text-white font-semibold mb-3">Atletas na fila para cadastro:</h3>
            <ul className="lista-clubes max-h-48 overflow-y-auto bg-primaryPurple p-3 rounded">
              {atletasParaCadastrar.map((atleta, index) => (
                <li key={index} className="item-clube">
                  {atleta.nome} - {atleta.posicao} ({atleta.clubeNome})
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
            className={`mt-4 text-center font-medium p-2 rounded ${
              erro ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
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

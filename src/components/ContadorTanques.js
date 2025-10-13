import { useState } from "react";
import { territoriosWar } from "./TerritoriosTanques.js";

const MAX_VIDAS = 10;
const MIN_VIDAS = 0;
const JOGADORES_INICIAIS = 6;
const TANQUES_POR_JOGADOR = 12;

export default function ContadorDeTanques() {
  const [jogadores, setJogadores] = useState(
    Array.from({ length: JOGADORES_INICIAIS }, (_, index) => ({
      nome: `Jogador ${index + 1}`,
      tanques: Array.from({ length: TANQUES_POR_JOGADOR }, () => ({
        vidas: MAX_VIDAS,
        territorio: "",
      })),
    }))
  );

  const [jogadorSelecionado, setJogadorSelecionado] = useState(0);

  const handleChangeNome = (index, novoNome) => {
    const novos = [...jogadores];
    novos[index].nome = novoNome;
    setJogadores(novos);
  };

  const handleVida = (jogadorIndex, tanqueIndex, delta) => {
    setJogadores((prev) => {
      const atual = [...prev];
      const tanque = atual[jogadorIndex].tanques[tanqueIndex];
      const novaVida = Math.max(
        MIN_VIDAS,
        Math.min(MAX_VIDAS, tanque.vidas + delta)
      );
      tanque.vidas = novaVida;
      return atual;
    });
  };

  const handleTerritorioChange = (jogadorIndex, tanqueIndex, territorio) => {
    const novos = [...jogadores];
    novos[jogadorIndex].tanques[tanqueIndex].territorio = territorio;
    setJogadores(novos);
  };

  const getCorFundo = (vidas) => {
    if (vidas === 0) return "#1f1f1f";
    if (vidas <= 3) return "#dc2626";
    if (vidas <= 5) return "#facc15";
    return "#22c55e";
  };

  const getIconeDados = (vidas) => {
    if (vidas >= 3) return "🎲🎲🎲";
    if (vidas === 2) return "🎲🎲";
    if (vidas === 1) return "🎲";
    return "💥";
  };

  return (
    <div className="form-card">
      {/* Seleção de jogador */}
      <div className="mb-6">
        <label className="text-white font-semibold mr-2">
          Selecionar Jogador:
        </label>
        <select
          value={jogadorSelecionado}
          onChange={(e) => setJogadorSelecionado(parseInt(e.target.value))}
          className="filtro-select"
        >
          {jogadores.map((j, index) => (
            <option key={index} value={index}>
              {j.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Nome do jogador */}
      <div className="mb-6">
        <input
          type="text"
          value={jogadores[jogadorSelecionado].nome}
          onChange={(e) => handleChangeNome(jogadorSelecionado, e.target.value)}
          placeholder="Nome do jogador"
          className="form-input"
        />
      </div>

      {/* Grid de tanques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jogadores[jogadorSelecionado].tanques.map((tanque, index) => (
          <div
            key={index}
            className="rounded-xl shadow-lg p-4 text-center text-white"
            style={{ backgroundColor: getCorFundo(tanque.vidas) }}
          >
            <div className="text-lg font-bold mb-2">
              🛡️ Tanque {index + 1}
            </div>

            <div className="mb-3 font-semibold">
              {tanque.vidas} vidas &nbsp; {getIconeDados(tanque.vidas)}
            </div>

            <div className="flex justify-center space-x-3 mb-3">
              <button
                onClick={() => handleVida(jogadorSelecionado, index, -1)}
                className="botao-estatistica"
              >
                -
              </button>
              <button
                onClick={() => handleVida(jogadorSelecionado, index, 1)}
                className="botao-estatistica"
              >
                +
              </button>
            </div>

            <select
              value={tanque.territorio}
              onChange={(e) =>
                handleTerritorioChange(jogadorSelecionado, index, e.target.value)
              }
              className="filtro-select w-full"
              style={{
                backgroundColor:
                  territoriosWar.find((t) => t.nome === tanque.territorio)?.cor ||
                  "white",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              <option value="">Selecione o território</option>
              {territoriosWar.map((t, i) => (
                <option key={i} value={t.nome}>
                  {t.nome} ({t.continente})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

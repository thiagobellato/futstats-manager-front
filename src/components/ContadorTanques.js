import React, { useState } from "react";
import { territoriosWar } from "./TerritoriosTanques.js";
import { User, Plus, Minus, MapPin } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Input } from './ui/Input';

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
      const atual = JSON.parse(JSON.stringify(prev));
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
    const novos = JSON.parse(JSON.stringify(jogadores));
    novos[jogadorIndex].tanques[tanqueIndex].territorio = territorio;
    setJogadores(novos);
  };

  const getCorVidas = (vidas) => {
    if (vidas === 0) return 'text-brand-muted opacity-50';
    if (vidas <= 3) return 'text-red-500';
    if (vidas <= 5) return 'text-yellow-500';
    return 'text-brand-primary';
  };

  const getEmojiVidas = (vidas) => {
    if (vidas >= 7) return "🛡️";
    if (vidas >= 4) return "⚔️";
    if (vidas >= 1) return "⚠️";
    return "💀";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">War <span className="text-brand-primary text-xl">Tank Counter</span></h2>
          <p className="text-brand-muted text-sm mt-1">Gerencie as vidas e territórios dos seus tanques.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-brand-card p-2 rounded-xl border border-brand-border">
          <User className="text-brand-primary ml-2 w-5 h-5" />
          <select
            value={jogadorSelecionado}
            onChange={(e) => setJogadorSelecionado(parseInt(e.target.value))}
            className="bg-transparent text-white font-bold focus:outline-none pr-8 cursor-pointer"
          >
            {jogadores.map((j, index) => (
              <option key={index} value={index} className="bg-brand-card text-white">
                {j.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <div className="max-w-md mb-8">
          <Input
            label="Renomear Jogador"
            value={jogadores[jogadorSelecionado].nome}
            onChange={(e) => handleChangeNome(jogadorSelecionado, e.target.value)}
            placeholder="Ex: General Thiago"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jogadores[jogadorSelecionado].tanques.map((tanque, index) => (
            <div
              key={index}
              className={`relative bg-brand-dark rounded-2xl border transition-all duration-300 p-5 ${
                tanque.vidas === 0 ? 'border-brand-border opacity-60 grayscale' : 'border-brand-border hover:border-brand-primary shadow-lg hover:shadow-brand-primary/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-brand-muted uppercase tracking-widest">T-{index + 1}</span>
                <span className="text-2xl">{getEmojiVidas(tanque.vidas)}</span>
              </div>

              <div className="text-center py-4">
                <div className={`text-5xl font-black mb-1 ${getCorVidas(tanque.vidas)}`}>
                  {tanque.vidas}
                </div>
                <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest">Vidas Restantes</p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="rounded-full w-10 h-10 p-0" 
                  onClick={() => handleVida(jogadorSelecionado, index, -1)}
                  disabled={tanque.vidas === MIN_VIDAS}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-full w-10 h-10 p-0 shadow-lg shadow-brand-primary/20" 
                  onClick={() => handleVida(jogadorSelecionado, index, 1)}
                  disabled={tanque.vidas === MAX_VIDAS}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-brand-muted uppercase font-bold ml-1">Território</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none group-focus-within:text-brand-primary transition-colors w-4 h-4" />
                  <select
                    value={tanque.territorio}
                    onChange={(e) => handleTerritorioChange(jogadorSelecionado, index, e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                  >
                    <option value="">Nenhum</option>
                    {territoriosWar.map((t, i) => (
                      <option key={i} value={t.nome}>
                        {t.nome} ({t.continente})
                      </option>
                    ))}
                  </select>
                </div>
                {tanque.territorio && (
                   <div 
                    className="h-1 w-full mt-2 rounded-full" 
                    style={{ backgroundColor: territoriosWar.find((t) => t.nome === tanque.territorio)?.cor || "#27272a" }}
                  ></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

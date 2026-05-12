import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export default function SearchableSelect({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Selecione...", 
  error,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Função para normalizar texto (remover acentos e lowercase)
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    if (!normalizedSearch) return options;

    const matches = options.map(opt => {
      const normalizedLabel = normalizeText(opt.label);
      const normalizedCountry = normalizeText(opt.country || "");
      const normalizedCode = normalizeText(opt.code || "");
      
      let priority = 0;
      
      // Prioridade Máxima: Início do Código ISO (ex: PT, BR)
      if (normalizedCode.startsWith(normalizedSearch)) {
        priority = 100;
      }
      // Prioridade Alta: Início da Nacionalidade (ex: POR -> Portuguesa)
      else if (normalizedLabel.startsWith(normalizedSearch)) {
        priority = 80;
      }
      // Prioridade Média: Início do nome do País (ex: HUN -> Hungria)
      else if (normalizedCountry.startsWith(normalizedSearch)) {
        priority = 60;
      }
      // Prioridade Baixa: Contém o termo em qualquer parte
      else if (normalizedLabel.includes(normalizedSearch) || normalizedCountry.includes(normalizedSearch)) {
        priority = 20;
      }
      
      return { ...opt, priority };
    }).filter(opt => opt.priority > 0);

    // Ordenar por prioridade e depois alfabeticamente
    return matches.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.label.localeCompare(b.label);
    });
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value, name: label } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      default:
        break;
    }
  };

  // Scroll estável e previsível
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const element = listRef.current.children[highlightedIndex];
      if (element) {
        element.scrollIntoView({ 
          block: 'nearest', 
          inline: 'start', 
          behavior: 'auto' // 'auto' é mais estável que 'smooth' para navegação rápida
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-medium text-brand-muted">{label}</label>}
      
      <div 
        className={`
          w-full bg-brand-card border rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all duration-300
          ${isOpen ? 'border-brand-primary ring-4 ring-brand-primary/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-brand-border hover:border-brand-muted hover:bg-brand-card/60'}
          ${error ? 'border-red-500' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedOption ? (
            <div className="flex items-center gap-3 text-white truncate animate-in fade-in zoom-in-95 duration-300">
              {selectedOption.flag && <span className="text-xl leading-none">{selectedOption.flag}</span>}
              <span className="font-semibold tracking-wide">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-brand-muted select-none italic">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'rotate-180 text-brand-primary scale-110' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full z-[100] bg-brand-card border border-brand-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300 ease-out">
          <div className="p-4 border-b border-brand-border flex items-center gap-4 bg-brand-dark/60 sticky top-0 backdrop-blur-xl">
            <Search className="w-5 h-5 text-brand-primary animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent border-none outline-none text-base text-white w-full py-1 placeholder:text-brand-muted/70"
              placeholder="Pesquise por nome, país ou sigla (PT, BR...)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0); 
              }}
              onKeyDown={handleKeyDown}
            />
            {searchTerm && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }} 
                className="p-1.5 hover:bg-brand-border rounded-full transition-all hover:rotate-90"
              >
                <X className="w-4 h-4 text-brand-muted hover:text-white" />
              </button>
            )}
          </div>
          
          <ul 
            ref={listRef}
            className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1"
            onMouseLeave={() => setHighlightedIndex(-1)}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm
                    ${index === highlightedIndex ? 'bg-brand-primary/10 text-brand-primary translate-x-2' : 'text-brand-muted hover:bg-brand-border/30 hover:text-white'}
                    ${value === option.value ? 'bg-brand-primary text-brand-dark font-black shadow-lg translate-x-1' : ''}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-4">
                    {option.flag && <span className="text-2xl leading-none drop-shadow-md">{option.flag}</span>}
                    <div className="flex flex-col">
                      <span className={`text-[15px] ${value === option.value ? 'text-brand-dark' : 'text-inherit'}`}>
                        {option.label}
                      </span>
                      {option.country && option.country !== option.label && (
                        <span className={`text-[10px] uppercase tracking-widest mt-0.5 opacity-60 ${value === option.value ? 'text-brand-dark' : ''}`}>
                          {option.country}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {option.code && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${value === option.value ? 'border-brand-dark/30 text-brand-dark' : 'border-brand-border text-brand-muted opacity-50'}`}>
                        {option.code}
                      </span>
                    )}
                    {value === option.value && (
                      <div className="w-5 h-5 bg-brand-dark rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-brand-primary stroke-[4px]" />
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 opacity-30">
                  <div className="w-16 h-16 rounded-full bg-brand-border flex items-center justify-center mb-2">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="text-white text-lg font-bold">Sem resultados</p>
                  <p className="text-brand-muted text-sm max-w-[200px] mx-auto">Não encontramos nada para "{searchTerm}".</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <span className="text-xs text-red-500 mt-1.5 pl-1 font-medium">{error}</span>}
    </div>
  );
}

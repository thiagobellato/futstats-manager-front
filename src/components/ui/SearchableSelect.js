import React, { useState, useRef, useEffect } from 'react';
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

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      inputRef.current?.focus();
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

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const element = listRef.current.children[highlightedIndex];
      element?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-medium text-brand-muted">{label}</label>}
      
      <div 
        className={`
          w-full bg-brand-card border rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all
          ${isOpen ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-brand-border hover:border-brand-muted'}
          ${error ? 'border-red-500' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <div className="flex items-center gap-2 text-white truncate">
              {selectedOption.flag && <span>{selectedOption.flag}</span>}
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-brand-muted">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-brand-card border border-brand-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-brand-border flex items-center gap-2 bg-brand-dark/50">
            <Search className="w-4 h-4 text-brand-muted" />
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent border-none outline-none text-sm text-white w-full py-1 placeholder:text-brand-muted"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="p-1 hover:bg-brand-border rounded-md transition-colors">
                <X className="w-3 h-3 text-brand-muted" />
              </button>
            )}
          </div>
          
          <ul 
            ref={listRef}
            className="max-h-60 overflow-y-auto custom-scrollbar p-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm
                    ${index === highlightedIndex ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-border/50 hover:text-white'}
                    ${value === option.value ? 'bg-brand-primary/20 text-brand-primary font-bold' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    {option.flag && <span className="text-lg">{option.flag}</span>}
                    <span>{option.label}</span>
                  </div>
                  {value === option.value && <Check className="w-4 h-4" />}
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-brand-muted text-xs">
                Nenhuma nacionalidade encontrada.
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}

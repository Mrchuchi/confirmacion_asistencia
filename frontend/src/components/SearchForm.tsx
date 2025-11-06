import React, { useState } from 'react';
import type { FormEvent } from 'react';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, onClear }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <div className="search-form-container">
      <h2>Búsqueda de Invitados</h2>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingrese cédula o nombre del invitado"
            className="search-input"
            disabled={isLoading}
            autoFocus
          />
          <div className="button-group">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="search-button"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              disabled={isLoading}
            >
              Limpiar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

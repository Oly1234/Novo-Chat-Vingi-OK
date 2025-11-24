import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Users, FileText, MessageSquare, Loader } from 'lucide-react';
import './GlobalSearch.css';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Carregar buscas recentes
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      // Debounce da busca
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      searchTimeout.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
    }
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/search/global?q=${encodeURIComponent(searchQuery)}`,
        { headers: { 'X-Admin-Password': password } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        
        // Salvar busca recente
        saveRecentSearch(searchQuery);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'ticket':
        return <FileText size={20} />;
      case 'customer':
        return <Users size={20} />;
      case 'session':
        return <MessageSquare size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  const getResultBadge = (type) => {
    const badges = {
      ticket: { text: 'Ticket', color: '#6366f1' },
      customer: { text: 'Cliente', color: '#10b981' },
      session: { text: 'Sessão', color: '#f59e0b' },
      knowledge: { text: 'KB', color: '#8b5cf6' }
    };
    return badges[type] || badges.ticket;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="search-overlay" onClick={onClose} />
      <div className="global-search-modal">
        <div className="search-header">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar em tudo... (tickets, clientes, sessões)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            {loading && <Loader size={20} className="search-loader" />}
            {query && (
              <button className="search-clear" onClick={() => setQuery('')}>
                <X size={18} />
              </button>
            )}
          </div>
          <button className="search-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="search-body">
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="search-section">
              <div className="section-header">
                <div className="section-title">
                  <Clock size={16} />
                  <span>Buscas Recentes</span>
                </div>
                <button className="clear-recent-btn" onClick={clearRecentSearches}>
                  Limpar
                </button>
              </div>
              <div className="recent-searches">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="recent-search-item"
                    onClick={() => setQuery(search)}
                  >
                    <Clock size={14} />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="search-empty">
              <Search size={48} />
              <h3>Nenhum resultado encontrado</h3>
              <p>Tente buscar por outros termos</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results">
              {Object.entries(
                results.reduce((acc, item) => {
                  if (!acc[item.type]) acc[item.type] = [];
                  acc[item.type].push(item);
                  return acc;
                }, {})
              ).map(([type, items]) => (
                <div key={type} className="search-section">
                  <div className="section-header">
                    <div className="section-title">
                      {getResultIcon(type)}
                      <span>{type === 'ticket' ? 'Tickets' : type === 'customer' ? 'Clientes' : 'Sessões'}</span>
                      <span className="result-count">({items.length})</span>
                    </div>
                  </div>
                  <div className="result-list">
                    {items.map((item, index) => (
                      <div key={index} className="result-item" onClick={() => {
                        // Navegar para o item
                        console.log('Navigate to:', item);
                        onClose();
                      }}>
                        <div className="result-icon">
                          {getResultIcon(item.type)}
                        </div>
                        <div className="result-content">
                          <div className="result-title">{item.title}</div>
                          <div className="result-subtitle">{item.subtitle}</div>
                        </div>
                        <span 
                          className="result-badge"
                          style={{ background: getResultBadge(item.type).color }}
                        >
                          {getResultBadge(item.type).text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-footer">
          <div className="search-tips">
            <kbd>↵</kbd> para selecionar
            <kbd>Esc</kbd> para fechar
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;
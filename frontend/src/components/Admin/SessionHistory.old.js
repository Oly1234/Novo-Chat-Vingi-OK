import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, Filter } from 'lucide-react';
import './SessionHistory.css';

export const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/sessions`, {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewSession = async (sessionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/session/${sessionId}`, {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      if (response.ok) {
        const data = await response.json();
        alert(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Failed to view session:', error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         session.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || session.department === filterDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return <div className="session-loading">Carregando histórico...</div>;
  }

  return (
    <div className="session-history">
      <div className="session-header">
        <div>
          <h2>Histórico de Conversas</h2>
          <p>{sessions.length} sessões registradas</p>
        </div>
      </div>

      <div className="session-controls">
        <div className="session-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por ID ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="session-filter"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="all">Todos os departamentos</option>
          <option value="VAGAS">VAGAS</option>
          <option value="AMOSTRAS">AMOSTRAS</option>
          <option value="ESTAMPAS">ESTAMPAS</option>
          <option value="SUPORTE">SUPORTE</option>
        </select>
      </div>

      <div className="session-list">
        {filteredSessions.length === 0 ? (
          <div className="session-empty">
            <p>Nenhuma sessão encontrada</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div key={session.id} className="session-item">
              <div className="session-item__info">
                <div className="session-item__id">ID: {session.id?.slice(0, 8)}</div>
                <div className="session-item__user">Usuário: {session.userId?.slice(0, 12)}</div>
                {session.department && (
                  <span className={`session-item__dept session-item__dept--${session.department.toLowerCase()}`}>
                    {session.department}
                  </span>
                )}
                <div className="session-item__date">
                  {new Date(session.startedAt).toLocaleString('pt-BR')}
                </div>
              </div>
              <button
                className="session-item__view"
                onClick={() => viewSession(session.id)}
              >
                <Eye size={16} />
                Ver Detalhes
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Card, CardBody } from '../UI/Card';
import { Input } from '../UI/Input';
import './SessionHistory.css';

export const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions', {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="session-history">
      <div className="history-header">
        <h2 className="history-title">Histórico de Atendimentos</h2>
        <Input
          placeholder="Buscar sessão..."
          icon={<Search size={18} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="history-search"
        />
      </div>

      <div className="history-list">
        {filteredSessions.map(session => (
          <Card key={session.id} className="history-item" hover>
            <CardBody>
              <div className="history-item-header">
                <div className="history-item-id">{session.id.substring(0, 12)}...</div>
                {session.department && (
                  <div className="history-item-dept">{session.department}</div>
                )}
                <div className={`history-item-status history-item-status--${session.status}`}>
                  {session.status}
                </div>
              </div>
              <div className="history-item-info">
                <div>Usuário: {session.userId}</div>
                <div>Início: {new Date(session.startedAt).toLocaleString('pt-BR')}</div>
              </div>
              <button className="history-item-view">
                <Eye size={16} />
                Ver Mensagens
              </button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

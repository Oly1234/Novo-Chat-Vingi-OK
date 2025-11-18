import React, { useState, useEffect } from 'react';
import { RefreshCw, MessageSquare, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import './QueueManagement.css';

export const QueueManagement = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/queue`, {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue || []);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignToAgent = async (sessionId) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/queue/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': localStorage.getItem('adminPassword')
        },
        body: JSON.stringify({ sessionId, agentId: 'admin' })
      });
      fetchQueue();
    } catch (error) {
      console.error('Failed to assign:', error);
    }
  };

  const filteredQueue = queue.filter(item => {
    if (activeFilter === 'all') return true;
    return item.department === activeFilter;
  });

  const departments = ['all', 'VAGAS', 'AMOSTRAS', 'ESTAMPAS', 'SUPORTE'];

  if (loading) {
    return <div className="queue-loading">Carregando fila...</div>;
  }

  return (
    <div className="queue-management">
      <div className="queue-header">
        <div>
          <h2>Gerenciamento de Fila</h2>
          <p>{queue.length} usuários aguardando</p>
        </div>
        <button onClick={fetchQueue} className="queue-refresh">
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      <div className="queue-filters">
        {departments.map(dept => (
          <button
            key={dept}
            className={`queue-filter ${activeFilter === dept ? 'queue-filter--active' : ''}`}
            onClick={() => setActiveFilter(dept)}
          >
            {dept === 'all' ? 'Todos' : dept}
          </button>
        ))}
      </div>

      <div className="queue-list">
        {filteredQueue.length === 0 ? (
          <div className="queue-empty">
            <MessageSquare size={48} />
            <p>Nenhum usuário na fila</p>
          </div>
        ) : (
          filteredQueue.map((item, index) => (
            <div key={item.sessionId} className="queue-item">
              <div className="queue-item__position">{index + 1}</div>
              <div className="queue-item__info">
                <div className="queue-item__user">
                  <User size={16} />
                  <span>Usuário {item.userId?.slice(0, 8) || 'Anônimo'}</span>
                </div>
                <div className="queue-item__meta">
                  {item.department && (
                    <span className={`queue-item__dept queue-item__dept--${item.department.toLowerCase()}`}>
                      {item.department}
                    </span>
                  )}
                  <span className="queue-item__time">
                    <Clock size={14} />
                    {new Date(item.startedAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="queue-item__actions">
                <button
                  className="queue-item__action queue-item__action--primary"
                  onClick={() => assignToAgent(item.sessionId)}
                >
                  <CheckCircle size={16} />
                  Atender
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

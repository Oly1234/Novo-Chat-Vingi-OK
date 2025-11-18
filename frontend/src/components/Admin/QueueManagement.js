import React, { useState, useEffect } from 'react';
import { RefreshCw, MessageSquare, Clock, User } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card, CardHeader, CardBody } from '../UI/Card';
import './QueueManagement.css';

export const QueueManagement = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/admin/queue', {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      const data = await response.json();
      setQueue(data.queue || []);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000 / 60);
    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}min atrás`;
    return `${Math.floor(diff / 60)}h atrás`;
  };

  if (loading) {
    return <div className="queue-loading">Carregando fila...</div>;
  }

  return (
    <div className="queue-management">
      <div className="queue-header">
        <div>
          <h2 className="queue-title">Fila de Atendimento</h2>
          <p className="queue-subtitle">{queue.length} pessoa(s) aguardando</p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw size={18} />}
          onClick={fetchQueue}
        >
          Atualizar
        </Button>
      </div>

      {queue.length === 0 ? (
        <Card>
          <CardBody>
            <div className="queue-empty">
              <MessageSquare size={48} />
              <h3>Fila vazia</h3>
              <p>Nenhuma pessoa aguardando atendimento no momento</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="queue-list">
          {queue.map((item, index) => (
            <Card key={item.id} className="queue-item" hover>
              <CardBody>
                <div className="queue-item-header">
                  <div className="queue-item-number">#{index + 1}</div>
                  <div className="queue-item-department">{item.department}</div>
                  <div className="queue-item-priority">
                    Prioridade: {item.priority}
                  </div>
                </div>
                <div className="queue-item-info">
                  <div className="queue-item-detail">
                    <User size={16} />
                    <span>Sessão: {item.sessionId.substring(0, 8)}...</span>
                  </div>
                  <div className="queue-item-detail">
                    <Clock size={16} />
                    <span>Aguardando: {formatTime(item.waitingSince)}</span>
                  </div>
                </div>
                <div className="queue-item-actions">
                  <Button variant="primary" size="small">
                    Atender Agora
                  </Button>
                  <Button variant="secondary" size="small">
                    Ver Histórico
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

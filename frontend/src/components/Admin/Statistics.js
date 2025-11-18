import React from 'react';
import { TrendingUp, MessageSquare, Users, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../UI/Card';
import './Statistics.css';

export const Statistics = ({ stats }) => {
  if (!stats) {
    return <div className="stats-loading">Carregando estatísticas...</div>;
  }

  const cards = [
    {
      title: 'Total de Sessões',
      value: stats.totalSessions || 0,
      icon: <MessageSquare size={24} />,
      color: '#0078D4',
      change: '+12%'
    },
    {
      title: 'Mensagens Trocadas',
      value: stats.totalMessages || 0,
      icon: <TrendingUp size={24} />,
      color: '#10893E',
      change: '+8%'
    },
    {
      title: 'Sessões Ativas',
      value: stats.activeSessions || 0,
      icon: <Users size={24} />,
      color: '#D97706',
      change: 'Agora'
    },
    {
      title: 'Na Fila',
      value: stats.waitingQueue || 0,
      icon: <Clock size={24} />,
      color: '#D13438',
      change: stats.waitingQueue > 0 ? 'Aguardando' : 'Vazia'
    }
  ];

  return (
    <div className="statistics">
      <h2 className="stats-title">Dashboard de Estatísticas</h2>
      
      <div className="stats-grid">
        {cards.map((card, index) => (
          <Card key={index} className="stat-card">
            <CardBody>
              <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </div>
                <span className="stat-change">{card.change}</span>
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-title">{card.title}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {stats.departmentStats && stats.departmentStats.length > 0 && (
        <Card className="department-stats">
          <CardHeader>
            <h3>Distribuição por Departamento</h3>
          </CardHeader>
          <CardBody>
            <div className="dept-list">
              {stats.departmentStats.map((dept, index) => (
                <div key={index} className="dept-item">
                  <div className="dept-name">{dept._id || 'Sem departamento'}</div>
                  <div className="dept-bar">
                    <div 
                      className="dept-bar-fill" 
                      style={{ 
                        width: `${(dept.count / stats.totalSessions) * 100}%`,
                        backgroundColor: ['#0078D4', '#10893E', '#D97706', '#D13438'][index % 4]
                      }}
                    />
                  </div>
                  <div className="dept-count">{dept.count}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

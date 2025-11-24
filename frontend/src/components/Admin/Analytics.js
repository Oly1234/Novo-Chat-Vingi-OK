import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageSquare, Star, Users, Download, Activity, Clock, Target } from 'lucide-react';
import Card from './shared/Card';
import Button from './shared/Button';
import StatCard from './shared/StatCard';
import './Analytics.css';

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`, {
        headers: { 'X-Admin-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type) => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/export/${type}`, {
        headers: { 'X-Admin-Password': password }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Carregando analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Métricas e indicadores de desempenho</p>
        </div>
        <div className="header-actions-group">
          <Button variant="secondary" icon={<Download size={18} />} onClick={() => exportData('sessions')}>
            Exportar Sessões
          </Button>
          <Button variant="secondary" icon={<Download size={18} />} onClick={() => exportData('candidates')}>
            Exportar Candidatos
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total de Sessões"
          value={analytics?.totalSessions || 0}
          icon={<MessageSquare size={24} />}
          color="primary"
          change={analytics?.sessionsGrowth}
        />
        <StatCard
          title="Candidatos"
          value={analytics?.totalCandidates || 0}
          icon={<Users size={24} />}
          color="success"
          change={analytics?.candidatesGrowth}
        />
        <StatCard
          title="Avaliação Média"
          value={analytics?.avgRating ? `${analytics.avgRating.toFixed(1)} ★` : 'N/A'}
          icon={<Star size={24} />}
          color="warning"
        />
        <StatCard
          title="Taxa de Conversão"
          value={analytics?.conversionRate ? `${analytics.conversionRate.toFixed(1)}%` : '0%'}
          icon={<Target size={24} />}
          color="primary"
        />
      </div>

      <div className="analytics-grid">
        <Card title="Sessões por Período" className="chart-card">
          <div className="chart-placeholder">
            <Activity size={48} />
            <p>Gráfico de sessões por período</p>
          </div>
        </Card>

        <Card title="Tempo Médio de Atendimento">
          <div className="metric-item">
            <Clock size={32} />
            <div className="metric-content">
              <div className="metric-value">{analytics?.avgResponseTime || '0s'}</div>
              <div className="metric-label">Tempo médio de resposta</div>
            </div>
          </div>
        </Card>
      </div>

      {analytics?.topKeywords && (
        <Card title="Palavras-chave Mais Buscadas">
          <div className="keywords-list">
            {analytics.topKeywords.map((keyword, index) => (
              <div key={index} className="keyword-item">
                <span className="keyword-rank">#{index + 1}</span>
                <span className="keyword-text">{keyword.term}</span>
                <span className="keyword-count">{keyword.count} buscas</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
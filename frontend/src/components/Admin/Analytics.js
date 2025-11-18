import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageSquare, Star, Users, Download } from 'lucide-react';
import './Analytics.css';

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`, {
        headers: {
          'X-Admin-Password': password
        }
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

  const exportSessions = async () => {
    try {
      setExporting(true);
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/export/sessions`, {
        headers: {
          'X-Admin-Password': password
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sessions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportCandidates = async () => {
    try {
      setExporting(true);
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/export/candidates`, {
        headers: {
          'X-Admin-Password': password
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Carregando analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">Erro ao carregar dados</div>;
  }

  return (
    <div className=\"analytics-container\">
      <div className=\"analytics-header\">
        <h2>Analytics & Relatórios</h2>
        <div className=\"analytics-actions\">
          <button onClick={exportSessions} disabled={exporting} className=\"export-btn\">
            <Download size={16} />
            Exportar Sessões
          </button>
          <button onClick={exportCandidates} disabled={exporting} className=\"export-btn\">
            <Download size={16} />
            Exportar Candidatos
          </button>
        </div>
      </div>

      <div className=\"analytics-grid\">
        <div className=\"analytics-card\">
          <div className=\"analytics-card-icon\" style={{ background: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div className=\"analytics-card-content\">
            <h3>Total de Sessões</h3>
            <p className=\"analytics-value\">{analytics.totalSessions}</p>
          </div>
        </div>

        <div className=\"analytics-card\">
          <div className=\"analytics-card-icon\" style={{ background: '#10b981' }}>
            <MessageSquare size={24} />
          </div>
          <div className=\"analytics-card-content\">
            <h3>Total de Mensagens</h3>
            <p className=\"analytics-value\">{analytics.totalMessages}</p>
          </div>
        </div>

        <div className=\"analytics-card\">
          <div className=\"analytics-card-icon\" style={{ background: '#f59e0b' }}>
            <TrendingUp size={24} />
          </div>
          <div className=\"analytics-card-content\">
            <h3>Média Msg/Sessão</h3>
            <p className=\"analytics-value\">{analytics.avgMessagesPerSession}</p>
          </div>
        </div>

        <div className=\"analytics-card\">
          <div className=\"analytics-card-icon\" style={{ background: '#fbbf24' }}>
            <Star size={24} />
          </div>
          <div className=\"analytics-card-content\">
            <h3>Avaliação Média</h3>
            <p className=\"analytics-value\">{analytics.avgRating.toFixed(1)} ⭐</p>
          </div>
        </div>
      </div>

      <div className=\"analytics-section\">
        <h3>Departamentos Mais Procurados</h3>
        <div className=\"analytics-chart\">
          {Object.entries(analytics.topDepartments).map(([dept, count]) => (
            <div key={dept} className=\"analytics-bar\">
              <span className=\"analytics-bar-label\">{dept}</span>
              <div className=\"analytics-bar-container\">
                <div 
                  className=\"analytics-bar-fill\" 
                  style={{ 
                    width: `${(count / Math.max(...Object.values(analytics.topDepartments))) * 100}%` 
                  }}
                />
                <span className=\"analytics-bar-value\">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className=\"analytics-section\">
        <h3>Sessões por Dia (Últimos 7 dias)</h3>
        <div className=\"analytics-timeline\">
          {analytics.sessionsByDay.map((day) => (
            <div key={day.date} className=\"analytics-timeline-item\">
              <div className=\"analytics-timeline-date\">{new Date(day.date).toLocaleDateString('pt-BR')}</div>
              <div className=\"analytics-timeline-bar\" style={{ height: `${(day.count / 10) * 100}px` }}>
                <span>{day.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

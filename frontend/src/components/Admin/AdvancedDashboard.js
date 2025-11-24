import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, MessageSquare, Clock, Target,
  Activity, Award, Calendar, Filter, Download
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import Card from './shared/Card';
import Button from './shared/Button';
import StatCard from './shared/StatCard';
import './AdvancedDashboard.css';

const AdvancedDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/advanced?range=${timeRange}`,
        { headers: { 'X-Admin-Password': password } }
      );
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data para demonstração
  const mockData = {
    kpis: {
      totalSessions: 547,
      totalTickets: 89,
      avgResponseTime: '2.3min',
      satisfactionRate: 94,
      activeAgents: 5,
      resolvedToday: 23
    },
    sessionsOverTime: [
      { date: '18/11', sessions: 45, messages: 234, tickets: 8 },
      { date: '19/11', sessions: 52, messages: 287, tickets: 12 },
      { date: '20/11', sessions: 38, messages: 198, tickets: 6 },
      { date: '21/11', sessions: 61, messages: 312, tickets: 15 },
      { date: '22/11', sessions: 58, messages: 295, tickets: 11 },
      { date: '23/11', sessions: 71, messages: 389, tickets: 18 },
      { date: '24/11', sessions: 82, messages: 421, tickets: 19 }
    ],
    departmentDistribution: [
      { name: 'Vendas', value: 245, color: '#6366f1' },
      { name: 'Suporte', value: 156, color: '#8b5cf6' },
      { name: 'RH', value: 89, color: '#ec4899' },
      { name: 'Amostras', value: 57, color: '#f59e0b' }
    ],
    agentPerformance: [
      { agent: 'Vendas', resolved: 45, pending: 8, avgTime: '2.1min' },
      { agent: 'Suporte', resolved: 38, pending: 12, avgTime: '3.2min' },
      { agent: 'RH', resolved: 23, pending: 5, avgTime: '1.8min' },
      { agent: 'Amostras', resolved: 19, pending: 3, avgTime: '1.5min' }
    ],
    hourlyActivity: [
      { hour: '08h', activity: 12 },
      { hour: '09h', activity: 28 },
      { hour: '10h', activity: 45 },
      { hour: '11h', activity: 52 },
      { hour: '12h', activity: 38 },
      { hour: '13h', activity: 41 },
      { hour: '14h', activity: 56 },
      { hour: '15h', activity: 63 },
      { hour: '16h', activity: 71 },
      { hour: '17h', activity: 58 },
      { hour: '18h', activity: 34 }
    ]
  };

  const displayData = data || mockData;

  if (loading && !data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="advanced-dashboard">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Dashboard Avançado</h1>
          <p className="page-subtitle">Análise completa de métricas e performance</p>
        </div>
        <div className="dashboard-actions">
          <select 
            className="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">24 horas</option>
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
          </select>
          <Button variant="secondary" icon={<Download size={18} />}>
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <StatCard
          title="Total de Sessões"
          value={displayData.kpis.totalSessions}
          icon={<MessageSquare size={24} />}
          color="primary"
          change={12}
        />
        <StatCard
          title="Tickets Abertos"
          value={displayData.kpis.totalTickets}
          icon={<Activity size={24} />}
          color="warning"
          change={-5}
        />
        <StatCard
          title="Tempo Médio"
          value={displayData.kpis.avgResponseTime}
          icon={<Clock size={24} />}
          color="success"
        />
        <StatCard
          title="Satisfação"
          value={`${displayData.kpis.satisfactionRate}%`}
          icon={<Award size={24} />}
          color="primary"
          change={3}
        />
        <StatCard
          title="Agentes Ativos"
          value={displayData.kpis.activeAgents}
          icon={<Users size={24} />}
          color="success"
        />
        <StatCard
          title="Resolvidos Hoje"
          value={displayData.kpis.resolvedToday}
          icon={<Target size={24} />}
          color="success"
          change={18}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <Card title="Sessões e Mensagens ao Longo do Tempo" className="chart-large">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData.sessionsOverTime}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorSessions)" 
                name="Sessões"
              />
              <Area 
                type="monotone" 
                dataKey="messages" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorMessages)" 
                name="Mensagens"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribuição por Departamento">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayData.departmentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {displayData.departmentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <Card title="Performance por Agente">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData.agentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="agent" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#10b981" name="Resolvidos" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pendentes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Atividade por Horário">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayData.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="activity" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                name="Atividade"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Bot, Clock, Users, Shield, 
  Palette, Database, Mail, MessageSquare, Save
} from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import './SettingsPanel.css';

const SettingsPanel = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Vingi Têxtil',
      supportEmail: 'contato@vingitextil.com.br',
      timezone: 'America/Sao_Paulo'
    },
    notifications: {
      sound: true,
      desktop: true,
      email: false,
      newTicket: true,
      newMessage: true,
      ticketResolved: false
    },
    ai: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
      autoRouting: true,
      sentiment: true
    },
    workingHours: {
      enabled: true,
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '18:00', enabled: true },
      saturday: { start: '08:00', end: '12:00', enabled: false },
      sunday: { start: '00:00', end: '00:00', enabled: false }
    },
    departments: [
      { id: 'vendas', name: 'Vendas', color: '#6366f1', enabled: true },
      { id: 'suporte', name: 'Suporte', color: '#8b5cf6', enabled: true },
      { id: 'rh', name: 'RH', color: '#ec4899', enabled: true },
      { id: 'amostras', name: 'Amostras', color: '#f59e0b', enabled: true }
    ]
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings`, {
        headers: { 'X-Admin-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        // Success feedback
        alert('Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'ai', label: 'Inteligência Artificial', icon: Bot },
    { id: 'hours', label: 'Horários', icon: Clock },
    { id: 'departments', label: 'Departamentos', icon: Users }
  ];

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="settings-content">
      <div className="form-group">
        <label>Nome da Empresa</label>
        <input
          type="text"
          value={settings.general.companyName}
          onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Email de Suporte</label>
        <input
          type="email"
          value={settings.general.supportEmail}
          onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Fuso Horário</label>
        <select
          value={settings.general.timezone}
          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
          className="form-select"
        >
          <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
          <option value="America/New_York">Nova York (GMT-5)</option>
          <option value="Europe/London">Londres (GMT+0)</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h3>Preferências de Notificação</h3>
        <div className="toggle-list">
          <div className="toggle-item">
            <div className="toggle-info">
              <strong>Som de Notificação</strong>
              <p>Reproduzir som ao receber notificações</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.sound}
                onChange={(e) => updateSetting('notifications', 'sound', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <strong>Notificações Desktop</strong>
              <p>Exibir notificações no desktop</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.desktop}
                onChange={(e) => updateSetting('notifications', 'desktop', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <strong>Notificações por Email</strong>
              <p>Receber notificações por email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Eventos de Notificação</h3>
        <div className="toggle-list">
          <div className="toggle-item">
            <div className="toggle-info">
              <strong>Novo Ticket</strong>
              <p>Notificar quando um novo ticket for criado</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.newTicket}
                onChange={(e) => updateSetting('notifications', 'newTicket', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <strong>Nova Mensagem</strong>
              <p>Notificar quando uma nova mensagem for recebida</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.newMessage}
                onChange={(e) => updateSetting('notifications', 'newMessage', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="settings-content">
      <div className="form-group">
        <label>Modelo de IA</label>
        <select
          value={settings.ai.model}
          onChange={(e) => updateSetting('ai', 'model', e.target.value)}
          className="form-select"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</option>
          <option value="gpt-4">GPT-4 (Preciso)</option>
        </select>
        <p className="form-hint">Modelo usado para processar mensagens</p>
      </div>
      
      <div className="form-group">
        <label>Temperatura ({settings.ai.temperature})</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.ai.temperature}
          onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
          className="form-range"
        />
        <p className="form-hint">0 = Respostas consistentes, 1 = Respostas criativas</p>
      </div>
      
      <div className="form-group">
        <label>Máximo de Tokens</label>
        <input
          type="number"
          value={settings.ai.maxTokens}
          onChange={(e) => updateSetting('ai', 'maxTokens', parseInt(e.target.value))}
          className="form-input"
          min="100"
          max="2000"
        />
        <p className="form-hint">Limite de tamanho das respostas</p>
      </div>
      
      <div className="toggle-list">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Roteamento Automático</strong>
            <p>Direcionar automaticamente para o agente especializado</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.ai.autoRouting}
              onChange={(e) => updateSetting('ai', 'autoRouting', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Análise de Sentimento</strong>
            <p>Detectar emoções nas mensagens dos clientes</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.ai.sentiment}
              onChange={(e) => updateSetting('ai', 'sentiment', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </div>
  );

  const renderHoursSettings = () => (
    <div className="settings-content">
      <div className="toggle-item" style={{ marginBottom: '24px' }}>
        <div className="toggle-info">
          <strong>Horário Comercial</strong>
          <p>Ativar horário de funcionamento</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.workingHours.enabled}
            onChange={(e) => updateSetting('workingHours', 'enabled', e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {settings.workingHours.enabled && (
        <div className="hours-grid">
          {Object.entries(settings.workingHours).filter(([key]) => key !== 'enabled').map(([day, hours]) => (
            <div key={day} className="hour-item">
              <div className="hour-day">
                <strong>{day.charAt(0).toUpperCase() + day.slice(1)}</strong>
                <label className="toggle-switch toggle-switch--small">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          [day]: { ...hours, enabled: e.target.checked }
                        }
                      }));
                    }}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              {hours.enabled && (
                <div className="hour-inputs">
                  <input
                    type="time"
                    value={hours.start}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          [day]: { ...hours, start: e.target.value }
                        }
                      }));
                    }}
                    className="form-input form-input--time"
                  />
                  <span>até</span>
                  <input
                    type="time"
                    value={hours.end}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          [day]: { ...hours, end: e.target.value }
                        }
                      }));
                    }}
                    className="form-input form-input--time"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDepartmentsSettings = () => (
    <div className="settings-content">
      <div className="departments-list">
        {settings.departments.map((dept, index) => (
          <div key={dept.id} className="department-item">
            <div 
              className="department-color" 
              style={{ background: dept.color }}
            />
            <div className="department-info">
              <input
                type="text"
                value={dept.name}
                onChange={(e) => {
                  const updated = [...settings.departments];
                  updated[index].name = e.target.value;
                  setSettings(prev => ({ ...prev, departments: updated }));
                }}
                className="form-input"
              />
            </div>
            <label className="toggle-switch toggle-switch--small">
              <input
                type="checkbox"
                checked={dept.enabled}
                onChange={(e) => {
                  const updated = [...settings.departments];
                  updated[index].enabled = e.target.checked;
                  setSettings(prev => ({ ...prev, departments: updated }));
                }}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="settings-panel">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie as configurações do sistema</p>
        </div>
        <Button 
          icon={<Save size={18} />} 
          onClick={saveSettings}
          loading={saving}
        >
          Salvar Alterações
        </Button>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={20} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-main">
          <Card>
            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'notifications' && renderNotificationSettings()}
            {activeSection === 'ai' && renderAISettings()}
            {activeSection === 'hours' && renderHoursSettings()}
            {activeSection === 'departments' && renderDepartmentsSettings()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

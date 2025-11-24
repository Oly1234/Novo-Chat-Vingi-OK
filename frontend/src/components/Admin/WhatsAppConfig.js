import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import './WhatsAppConfig.css';

export const WhatsAppConfig = ({ adminUser }) => {
  const [departments, setDepartments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  // Auto-save quando departments mudar (com debounce)
  useEffect(() => {
    if (departments.length > 0) {
      const timer = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save após 2s de inatividade

      return () => clearTimeout(timer);
    }
  }, [departments]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/whatsapp`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      setDepartments([]);
    }
  };

  const autoSave = async () => {
    if (departments.length === 0) return;
    
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({ departments })
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        setSaveMessage('✓ Salvo automaticamente');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({ 
          departments,
          updatedBy: adminUser || 'Admin'
        })
      });
      
      if (response.ok) {
        setSaveMessage('✅ Configuração salva com sucesso!');
        setLastSaved(new Date());
        setTimeout(() => setSaveMessage(''), 5000);
      } else {
        setSaveMessage('❌ Erro ao salvar');
      }
    } catch (error) {
      setSaveMessage('❌ Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const addDepartment = () => {
    const newDept = { 
      name: '', 
      displayName: '', 
      phone: '', 
      message: 'Olá! Vim do chat online da Vingi Têxtil.' 
    };
    setDepartments([...departments, newDept]);
  };

  const updateDepartment = (index, field, value) => {
    const updated = [...departments];
    updated[index] = { ...updated[index], [field]: value };
    setDepartments(updated);
  };

  const removeDepartment = (index) => {
    if (confirm('Deseja realmente remover este departamento?')) {
      setDepartments(departments.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="whatsapp-config">
      <div className="wac-header">
        <div>
          <h2 className="wac-title">Configuração WhatsApp</h2>
          <p className="wac-subtitle">Configure números por departamento para redirecionamento automático</p>
          <div style={{marginTop: '8px', padding: '12px', background: 'var(--surface-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)'}}>
            💡 <strong>Formato do telefone:</strong> Use código do país + DDD + número (ex: 5511999999999)<br/>
            🔗 O sistema gerará links wa.me automaticamente para redirecionar clientes
            {lastSaved && (
              <div style={{marginTop: '8px', color: 'var(--success)'}}>'
                🔄 Último salvamento: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        <div className="wac-actions">
          {saveMessage && (
            <span className={`save-message ${saveMessage.includes('✅') ? 'success' : saveMessage.includes('✓') ? 'auto' : 'error'}`}>
              {saveMessage}
            </span>
          )}
          <button className="btn-add" onClick={addDepartment}>
            <Plus size={20} />
            Adicionar Departamento
          </button>
          <button 
            className="btn-save" 
            onClick={saveConfig}
            disabled={isSaving}
          >
            <Save size={20} />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="wac-departments">
        {departments.length === 0 ? (
          <div className="wac-empty">
            <p>📱 Nenhum departamento configurado</p>
            <p>Clique em "Adicionar Departamento" para começar</p>
          </div>
        ) : (
          departments.map((dept, index) => (
            <div key={index} className="wac-card">
              <div className="wac-card-header">
                <h3>Departamento {index + 1}</h3>
                <button 
                  className="btn-delete"
                  onClick={() => removeDepartment(index)}
                  title="Remover departamento"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="wac-form">
                <div className="wac-form-group">
                  <label>Nome (ID)</label>
                  <input
                    type="text"
                    placeholder="AMOSTRAS"
                    value={dept.name || ''}
                    onChange={(e) => updateDepartment(index, 'name', e.target.value)}
                  />
                </div>
                <div className="wac-form-group">
                  <label>Nome de Exibição</label>
                  <input
                    type="text"
                    placeholder="Amostras e Orçamentos"
                    value={dept.displayName || ''}
                    onChange={(e) => updateDepartment(index, 'displayName', e.target.value)}
                  />
                </div>
                <div className="wac-form-group">
                  <label>Telefone WhatsApp (formato internacional)</label>
                  <input
                    type="text"
                    placeholder="5511999999999 (código país + DDD + número)"
                    value={dept.phone || ''}
                    onChange={(e) => updateDepartment(index, 'phone', e.target.value)}
                  />
                  {dept.phone && (
                    <div style={{marginTop: '4px', fontSize: '12px', color: 'var(--success)'}}>
                      ✓ Link: wa.me/{dept.phone}
                    </div>
                  )}
                </div>
                <div className="wac-form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Mensagem Padrão</label>
                  <input
                    type="text"
                    placeholder="Olá! Vim do chat online..."
                    value={dept.message || ''}
                    onChange={(e) => updateDepartment(index, 'message', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WhatsAppConfig;

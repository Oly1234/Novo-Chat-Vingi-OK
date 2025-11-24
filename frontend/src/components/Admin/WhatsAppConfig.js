import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card, CardHeader, CardBody } from '../UI/Card';
import { configAPI } from '../../services/api';
import './WhatsAppConfig.css';

export const WhatsAppConfig = () => {
  const [departments, setDepartments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

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
    updated[index][field] = value;
    setDepartments(updated);
  };

  const removeDepartment = (index) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const saveConfig = async () => {
    setIsSaving(true);
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
        alert('✅ Configuração salva!');
      } else {
        alert('❌ Erro ao salvar');
      }
    } catch (error) {
      alert('❌ Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="whatsapp-config">
      <div className="wac-header">
        <div>
          <h2 className="wac-title">Configuração WhatsApp</h2>
          <p className="wac-subtitle">Configure números por departamento para redirecionamento automático</p>
          <div style={{marginTop: '8px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px'}}>
            💡 <strong>Formato do telefone:</strong> Use código do país + DDD + número (ex: 5511999999999)<br/>
            🔗 O sistema gerará links wa.me automaticamente para redirecionar clientes
          </div>
        </div>
        <div className="wac-actions">
          <Button variant="secondary" icon={<Plus size={18} />} onClick={addDepartment}>
            Adicionar Departamento
          </Button>
          <Button variant="primary" icon={<Save size={18} />} onClick={saveConfig} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="wac-list">
        {departments.map((dept, index) => (
          <Card key={index} className="wac-item">
            <CardBody>
              <div className="wac-item-header">
                <h3>Departamento #{index + 1}</h3>
                <button className="wac-remove" onClick={() => removeDepartment(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="wac-form">
                <Input
                  label="Nome (ID)"
                  placeholder="AMOSTRAS"
                  value={dept.name}
                  onChange={(e) => updateDepartment(index, 'name', e.target.value)}
                />
                <Input
                  label="Nome de Exibição"
                  placeholder="Amostras e Orçamentos"
                  value={dept.displayName}
                  onChange={(e) => updateDepartment(index, 'displayName', e.target.value)}
                />
                <Input
                  label="Telefone WhatsApp (formato internacional)"
                  placeholder="5511999999999 (código país + DDD + número)"
                  value={dept.phone}
                  onChange={(e) => updateDepartment(index, 'phone', e.target.value)}
                />
                {dept.phone && (
                  <div style={{marginTop: '4px', fontSize: '12px', color: '#10b981'}}>
                    ✓ Link: wa.me/{dept.phone}
                  </div>
                )}
                <Input
                  label="Mensagem Padrão"
                  placeholder="Olá! Vim do chat..."
                  value={dept.message}
                  onChange={(e) => updateDepartment(index, 'message', e.target.value)}
                />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

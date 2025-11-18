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
      const data = await configAPI.getWhatsAppConfig();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const addDepartment = () => {
    setDepartments([...departments, {
      name: '',
      displayName: '',
      phone: '',
      message: ''
    }]);
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
      await configAPI.updateWhatsAppConfig(
        departments,
        localStorage.getItem('adminPassword')
      );
      alert('✅ Configuração salva!');
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
          <p className="wac-subtitle">Configure números por departamento</p>
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
                  label="Telefone (com DDD)"
                  placeholder="5511999999999"
                  value={dept.phone}
                  onChange={(e) => updateDepartment(index, 'phone', e.target.value)}
                />
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

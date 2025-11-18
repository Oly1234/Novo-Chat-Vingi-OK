import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input, TextArea } from '../UI/Input';
import { Card, CardHeader, CardBody } from '../UI/Card';
import './KnowledgeBase.css';

export const KnowledgeBase = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({ category: '', title: '', content: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-base', {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
    }
  };

  const saveKnowledgeBase = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': localStorage.getItem('adminPassword')
        },
        body: JSON.stringify({ items })
      });
      if (response.ok) {
        alert('✅ Base de conhecimento atualizada!');
      }
    } catch (error) {
      alert('❌ Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem.title || !newItem.content) return;
    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({ category: '', title: '', content: '' });
    setIsAdding(false);
  };

  const deleteItem = (id) => {
    if (confirm('Deletar este item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const categories = ['Site', 'Preços', 'Produtos', 'Contatos', 'Políticas', 'Outros'];

  return (
    <div className="knowledge-base">
      <div className="kb-header">
        <div>
          <h2 className="kb-title">Base de Conhecimento</h2>
          <p className="kb-subtitle">Informações que a IA pode usar nas respostas</p>
        </div>
        <div className="kb-actions">
          <Button
            variant="secondary"
            icon={<Plus size={18} />}
            onClick={() => setIsAdding(!isAdding)}
          >
            Adicionar Item
          </Button>
          <Button
            variant="primary"
            icon={<Save size={18} />}
            onClick={saveKnowledgeBase}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Tudo'}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="kb-add-form">
          <CardBody>
            <div className="kb-form">
              <select
                className="kb-select"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                <option value="">Selecione Categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input
                placeholder="Título"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
              />
              <TextArea
                placeholder="Conteúdo (informações que a IA pode usar)"
                value={newItem.content}
                onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                rows={4}
              />
              <div className="kb-form-actions">
                <Button variant="success" icon={<Check size={18} />} onClick={addItem}>
                  Adicionar
                </Button>
                <Button variant="ghost" icon={<X size={18} />} onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="kb-grid">
        {items.map(item => (
          <Card key={item.id} className="kb-item" hover>
            <CardHeader>
              <div className="kb-item-header">
                <span className="kb-item-category">{item.category}</span>
                <div className="kb-item-actions">
                  <button className="kb-item-action" onClick={() => deleteItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <h3 className="kb-item-title">{item.title}</h3>
              <p className="kb-item-content">{item.content}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {items.length === 0 && !isAdding && (
        <div className="kb-empty">
          <Database size={48} />
          <h3>Nenhum item ainda</h3>
          <p>Adicione informações para a IA usar nas respostas</p>
        </div>
      )}
    </div>
  );
};

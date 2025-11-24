import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Edit, Trash, Save } from 'lucide-react';
import Card from './shared/Card';
import Button from './shared/Button';
import './KnowledgeBase.css';

export const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ topic: '', content: '', keywords: '' });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/knowledge`, {
        headers: { 'X-Admin-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const url = editingId
        ? `${process.env.REACT_APP_BACKEND_URL}/api/admin/knowledge/${editingId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/admin/knowledge`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchArticles();
        setFormData({ topic: '', content: '', keywords: '' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este artigo?')) return;
    
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': password }
      });
      if (response.ok) {
        await fetchArticles();
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="kb-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Base de Conhecimento</h1>
          <p className="page-subtitle">Gerencie o conteúdo da IA</p>
        </div>
      </div>

      <Card title="Adicionar/Editar Artigo">
        <div className="kb-form">
          <input
            type="text"
            placeholder="Tópico"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="form-input"
          />
          <textarea
            placeholder="Conteúdo"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="form-textarea"
            rows={6}
          />
          <input
            type="text"
            placeholder="Palavras-chave (separadas por vírgula)"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            className="form-input"
          />
          <div className="form-actions">
            <Button icon={<Save size={18} />} onClick={handleSave}>
              {editingId ? 'Atualizar' : 'Adicionar'}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={() => {
                setEditingId(null);
                setFormData({ topic: '', content: '', keywords: '' });
              }}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card title="Artigos" subtitle={`${filteredArticles.length} artigo(s)`} padding="none">
        <div className="kb-toolbar">
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="kb-loading">
            <div className="loading-spinner" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <Database size={48} />
            <h3>Nenhum artigo encontrado</h3>
            <p>Adicione artigos para alimentar a base de conhecimento da IA</p>
          </div>
        ) : (
          <div className="kb-list">
            {filteredArticles.map(article => (
              <div key={article.id} className="kb-item">
                <div className="kb-item-content">
                  <h3 className="kb-item-title">{article.topic}</h3>
                  <p className="kb-item-text">{article.content}</p>
                  {article.keywords && (
                    <div className="kb-item-keywords">
                      {article.keywords.split(',').map((keyword, i) => (
                        <span key={i} className="keyword-tag">{keyword.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="kb-item-actions">
                  <button
                    className="action-btn"
                    onClick={() => {
                      setEditingId(article.id);
                      setFormData({
                        topic: article.topic,
                        content: article.content,
                        keywords: article.keywords || ''
                      });
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
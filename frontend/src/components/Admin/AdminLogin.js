import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card, CardBody } from '../UI/Card';
import './AdminLogin.css';

export const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Digite a senha');
      return;
    }
    
    localStorage.setItem('adminPassword', password);
    
    // Verify with API
    fetch('/api/admin/stats', {
      headers: { 'X-Admin-Password': password }
    })
      .then(res => {
        if (res.ok) {
          onLogin(password);
        } else {
          setError('Senha incorreta');
          localStorage.removeItem('adminPassword');
        }
      })
      .catch(() => {
        setError('Erro ao conectar');
      });
  };

  return (
    <div className="admin-login">
      <Card className="admin-login-card">
        <CardBody>
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <Lock size={32} />
            </div>
            <h1>Área Administrativa</h1>
            <p>Vingi Têxtil - Sistema de Atendimento</p>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <Input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              error={error}
              icon={<Lock size={18} />}
            />
            
            <Button
              type="submit"
              variant="primary"
              icon={<LogIn size={18} />}
              fullWidth
            >
              Entrar
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

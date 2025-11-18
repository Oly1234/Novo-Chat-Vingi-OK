import React, { useState, useEffect } from 'react';
import { Lock, LogIn, AlertTriangle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card, CardBody } from '../UI/Card';
import './AdminLogin.css';

const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 3;

export const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Check if locked on mount
  useEffect(() => {
    const lockData = localStorage.getItem('adminLockData');
    if (lockData) {
      const { lockEnd, attemptCount } = JSON.parse(lockData);
      const now = Date.now();
      
      if (lockEnd > now) {
        setIsLocked(true);
        setLockEndTime(lockEnd);
        setAttempts(attemptCount);
      } else {
        // Lock expired, reset
        localStorage.removeItem('adminLockData');
        setAttempts(0);
      }
    }
  }, []);

  // Update remaining time
  useEffect(() => {
    if (!isLocked || !lockEndTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = lockEndTime - now;

      if (remaining <= 0) {
        setIsLocked(false);
        setLockEndTime(null);
        setAttempts(0);
        localStorage.removeItem('adminLockData');
        setError('');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockEndTime]);

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockEnd = Date.now() + LOCK_DURATION;
      setIsLocked(true);
      setLockEndTime(lockEnd);
      
      localStorage.setItem('adminLockData', JSON.stringify({
        lockEnd,
        attemptCount: newAttempts
      }));

      setError(`Bloqueado por 30 minutos após ${MAX_ATTEMPTS} tentativas incorretas`);
    } else {
      setError(`Senha incorreta (${newAttempts}/${MAX_ATTEMPTS} tentativas)`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Acesso bloqueado. Aguarde ${timeRemaining}`);
      return;
    }

    if (!password) {
      setError('Digite a senha');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        // Success - reset attempts and login
        localStorage.removeItem('adminLockData');
        localStorage.setItem('adminPassword', password);
        setAttempts(0);
        onLogin(password);
      } else {
        handleFailedAttempt();
        localStorage.removeItem('adminPassword');
      }
    } catch (err) {
      setError('Erro ao conectar com servidor');
    }
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

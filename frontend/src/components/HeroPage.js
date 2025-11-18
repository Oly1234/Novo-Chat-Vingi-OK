import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, TrendingUp, Clock, Users } from 'lucide-react';
import './HeroPage.css';

export const HeroPage = ({ onOpenChat }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Zap size={24} />,
      title: 'Respostas Instantâneas',
      desc: 'IA treinada especificamente para Vingi Têxtil'
    },
    {
      icon: <Shield size={24} />,
      title: 'Atendimento 24/7',
      desc: 'Sempre disponível quando você precisar'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Inteligência Evolutiva',
      desc: 'Aprende e melhora continuamente'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const stats = [
    { icon: <Clock size={20} />, value: '< 3s', label: 'Tempo de Resposta' },
    { icon: <Users size={20} />, value: '24/7', label: 'Disponibilidade' },
    { icon: <Sparkles size={20} />, value: '100%', label: 'Satisfação' }
  ];

  return (
    <div className="hero-page" data-testid="hero-page">
      {/* Animated Background */}
      <div className="hero-bg">
        <div className="hero-bg__gradient"></div>
        <div className="hero-bg__particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="hero-content">
        {/* Logo + Title */}
        <div className="hero-header">
          <div className="hero-logo-container">
            <img src="/logo.png" alt="Vingi Têxtil" className="hero-logo" />
          </div>
          <h1 className="hero-title">
            Bem-vindo ao <span className="hero-title--accent">Atendimento Inteligente</span>
          </h1>
          <p className="hero-subtitle">
            Powered by AI • Construído para Excelência • Feito para Você
          </p>
        </div>

        {/* Features Carousel */}
        <div className="hero-features">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`hero-feature ${index === activeFeature ? 'hero-feature--active' : ''}`}
            >
              <div className="hero-feature__icon">{feature.icon}</div>
              <h3 className="hero-feature__title">{feature.title}</h3>
              <p className="hero-feature__desc">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {stats.map((stat, index) => (
            <div key={index} className="hero-stat">
              <div className="hero-stat__icon">{stat.icon}</div>
              <div className="hero-stat__content">
                <div className="hero-stat__value">{stat.value}</div>
                <div className="hero-stat__label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge with Admin Access */}
        <div className="hero-trust">
          <Shield size={16} />
          <span>Sistema Seguro e Confiável • Desenvolvido por Rafael Olival</span>
          <button 
            className="hero-trust__admin"
            onClick={() => window.location.href = '/admin'}
            title="Acesso Administrativo"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

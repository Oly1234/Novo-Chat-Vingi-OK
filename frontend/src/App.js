import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { ChatContainer } from './components/Chat/ChatContainer';
import { DeveloperCredit } from './components/UI/DeveloperCredit';
import '@/App.css';

const Home = () => {
  return (
    <div className="vingi-app">
      <div className="vingi-app__hero">
        <div className="vingi-app__container">
          <h1 className="vingi-app__title">Vingi Têxtil</h1>
          <p className="vingi-app__subtitle">
            Bem-vindo ao nosso sistema de atendimento inteligente
          </p>
          <p className="vingi-app__description">
            Clique no botão de chat para iniciar uma conversa com nosso assistente virtual
            ou falar diretamente com nossa equipe.
          </p>
        </div>
      </div>
      
      <ChatContainer />
      <DeveloperCredit />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;

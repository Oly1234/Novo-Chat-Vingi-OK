import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import './DeveloperCredit.css';

export const DeveloperCredit = () => {
  const [showModal, setShowModal] = useState(false);

  const handleWhatsAppContact = () => {
    const phone = '5519983569940'; // Formato: 55 + DDD + número
    const message = encodeURIComponent('Olá! Vi o sistema da Vingi Têxtil e gostaria de ter um sistema igual. Podemos conversar?');
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowModal(false);
  };

  return (
    <>
      <button 
        className="developer-credit"
        onClick={() => setShowModal(true)}
        data-testid="developer-credit"
      >
        Criado por Rafael Olival
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Sistema de Atendimento Profissional"
        size="small"
      >
        <div className="developer-credit-modal">
          <p className="developer-credit-modal__text">
            Gostaria de ter um sistema de atendimento online igual a este?
          </p>
          <p className="developer-credit-modal__subtext">
            Entre em contato comigo pelo WhatsApp e vamos conversar sobre como posso ajudar sua empresa!
          </p>
          <div className="developer-credit-modal__actions">
            <Button 
              variant="success" 
              onClick={handleWhatsAppContact}
              fullWidth
              data-testid="contact-whatsapp-button"
            >
              Entrar em Contato via WhatsApp
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowModal(false)}
              fullWidth
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

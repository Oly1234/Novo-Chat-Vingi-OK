import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import './RatingModal.css';

export const RatingModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await onSubmit({ rating, feedback });
      setTimeout(() => {
        onClose();
        setRating(0);
        setFeedback('');
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-modal" onClick={onClose}>
      <div className="rating-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal__header">
          <h3>Avaliar Atendimento</h3>
          <button onClick={onClose} className="rating-modal__close">
            <X size={20} />
          </button>
        </div>

        <div className="rating-modal__body">
          <p>Como foi sua experiência com nosso atendimento?</p>
          
          <div className="rating-modal__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`rating-modal__star ${
                  star <= (hover || rating) ? 'rating-modal__star--active' : ''
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star size={32} fill={star <= (hover || rating) ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          <div className="rating-modal__labels">
            <span>Ruim</span>
            <span>Excelente</span>
          </div>

          <textarea
            className="rating-modal__textarea"
            placeholder="Deixe um comentário (opcional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <div className="rating-modal__footer">
          <button
            onClick={onClose}
            className="rating-modal__button rating-modal__button--secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="rating-modal__button rating-modal__button--primary"
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
};

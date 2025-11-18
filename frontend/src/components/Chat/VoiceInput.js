import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import './VoiceInput.css';

export const VoiceInput = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      // Reset silence timer on speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Auto-stop after 2 seconds of silence
      if (finalTranscript) {
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            stopListening();
          }
        }, 2000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente novamente.');
      } else if (event.error === 'not-allowed') {
        setError('Permissão de microfone negada');
      } else {
        setError('Erro ao reconhecer fala');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript && transcript.trim()) {
        onTranscript(transcript.trim());
        setTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, isListening, onTranscript]);

  const startListening = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        setTranscript('');
        setError(null);
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Microphone permission error:', err);
      setError('Permissão de microfone necessária');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (error && error.includes('não suporta')) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="voice-input">
      <button
        className={`voice-input__button ${
          isListening ? 'voice-input__button--active' : ''
        }`}
        onClick={handleClick}
        disabled={disabled}
        title={isListening ? 'Parar gravação' : 'Gravar mensagem de voz'}
        data-testid="voice-input-button"
      >
        {isListening ? (
          <>
            <MicOff size={20} />
            <span className="voice-input__pulse" />
          </>
        ) : (
          <Mic size={20} />
        )}
      </button>

      {isListening && (
        <div className="voice-input__indicator">
          <div className="voice-input__indicator-dot" />
          <span>Ouvindo...</span>
        </div>
      )}

      {transcript && (
        <div className="voice-input__transcript">{transcript}</div>
      )}

      {error && error !== 'Seu navegador não suporta reconhecimento de voz' && (
        <div className="voice-input__error">{error}</div>
      )}
    </div>
  );
};

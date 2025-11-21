import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para auto-save automático a cada 2 minutos
 * @param {Function} saveFunction - Função que será chamada para salvar
 * @param {*} data - Dados a serem salvos
 * @param {Object} options - Opções { interval: ms, enabled: boolean }
 */
export const useAutoSave = (saveFunction, data, options = {}) => {
  const { 
    interval = 120000, // 2 minutos
    enabled = true,
    onSave = null,
    onError = null
  } = options;
  
  const intervalRef = useRef(null);
  const lastSavedRef = useRef(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;
    
    try {
      isSavingRef.current = true;
      
      // Verificar se dados mudaram
      const dataStr = JSON.stringify(data);
      if (dataStr === lastSavedRef.current) {
        return; // Nada mudou
      }
      
      await saveFunction(data);
      lastSavedRef.current = dataStr;
      
      if (onSave) {
        onSave(new Date());
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [saveFunction, data, enabled, onSave, onError]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Salvar imediatamente na primeira vez
    save();

    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      save();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [save, interval, enabled]);

  // Salvar ao desmontar componente
  useEffect(() => {
    return () => {
      if (enabled) {
        save();
      }
    };
  }, [save, enabled]);

  return { save, isSaving: isSavingRef.current };
};

export default useAutoSave;

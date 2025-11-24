/**
 * Processa mensagens da IA para identificar e converter marcadores
 * de redirecionamento WhatsApp em links clicáveis
 */

export const processWhatsAppRedirect = async (messageText, sessionId) => {
  // Regex para encontrar [WHATSAPP_REDIRECT:DEPARTAMENTO]
  const redirectPattern = /\[WHATSAPP_REDIRECT:(\w+)\]/g;
  
  let processedText = messageText;
  const matches = [...messageText.matchAll(redirectPattern)];
  
  for (const match of matches) {
    const department = match[1];
    
    try {
      // Buscar configuração do WhatsApp para o departamento
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/whatsapp`);
      if (response.ok) {
        const { departments } = await response.json();
        const dept = departments.find(d => d.name === department);
        
        if (dept && dept.phone) {
          // Gerar mensagem contextualizada
          const defaultMessage = dept.message || `Olá! Vim do chat online da Vingi Têxtil.`;
          const encodedMessage = encodeURIComponent(defaultMessage);
          
          // Criar link wa.me
          const waLink = `https://wa.me/${dept.phone}?text=${encodedMessage}`;
          
          // Substituir marcador por link clicável (HTML)
          const linkHtml = `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="whatsapp-redirect-link">
            📱 Clique aqui para continuar no WhatsApp com ${dept.displayName || dept.name}
          </a>`;
          
          processedText = processedText.replace(match[0], linkHtml);
        } else {
          // Fallback se departamento não encontrado
          processedText = processedText.replace(
            match[0], 
            `❌ Departamento ${department} não configurado. Entre em contato pelo telefone.`
          );
        }
      }
    } catch (error) {
      console.error('Erro ao processar redirecionamento WhatsApp:', error);
      processedText = processedText.replace(
        match[0],
        '❌ Erro ao gerar link. Por favor, tente novamente.'
      );
    }
  }
  
  return processedText;
};

/**
 * Verifica se uma mensagem contém marcadores de redirecionamento
 */
export const hasWhatsAppRedirect = (messageText) => {
  return /\[WHATSAPP_REDIRECT:\w+\]/.test(messageText);
};

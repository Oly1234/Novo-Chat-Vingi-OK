/**
 * Firebase Persistence Service - Auto-save por aba
 * Salva estado de cada aba automaticamente no Firebase
 */

class PersistenceService {
  constructor() {
    this.saveQueue = new Map();
    this.saveInterval = 120000; // 2 minutos
    this.timers = new Map();
  }

  /**
   * Inicia persistência automática para uma aba
   * @param {string} tabId - ID da aba
   * @param {object} initialData - Dados iniciais
   * @param {function} saveFunction - Função para salvar no Firebase
   */
  startPersistence(tabId, initialData, saveFunction) {
    // Carregar dados salvos
    const saved = this.loadFromLocal(tabId);
    
    // Configurar auto-save
    if (this.timers.has(tabId)) {
      clearInterval(this.timers.get(tabId));
    }

    const timer = setInterval(() => {
      this.save(tabId, saveFunction);
    }, this.saveInterval);

    this.timers.set(tabId, timer);

    return saved || initialData;\n  }\n\n  /**\n   * Para persistência de uma aba\n   * @param {string} tabId - ID da aba\n   * @param {boolean} forceSave - Forçar salvamento antes de parar\n   */\n  async stopPersistence(tabId, forceSave = true) {\n    if (this.timers.has(tabId)) {\n      clearInterval(this.timers.get(tabId));\n      this.timers.delete(tabId);\n    }\n\n    if (forceSave && this.saveQueue.has(tabId)) {\n      const { data, saveFunction } = this.saveQueue.get(tabId);\n      await this.executeS ave(data, saveFunction);\n    }\n\n    this.saveQueue.delete(tabId);\n  }\n\n  /**\n   * Atualiza dados da aba (adiciona à fila de salvamento)\n   * @param {string} tabId - ID da aba\n   * @param {object} data - Dados atualizados\n   * @param {function} saveFunction - Função para salvar no Firebase\n   */\n  updateData(tabId, data, saveFunction) {\n    this.saveQueue.set(tabId, { data, saveFunction, timestamp: Date.now() });\n    this.saveToLocal(tabId, data);\n  }\n\n  /**\n   * Salva dados imediatamente\n   * @param {string} tabId - ID da aba\n   * @param {function} saveFunction - Função personalizada (opcional)\n   */\n  async save(tabId, saveFunction = null) {\n    if (!this.saveQueue.has(tabId)) return;\n\n    const { data, saveFunction: queuedSaveFunction } = this.saveQueue.get(tabId);\n    const fn = saveFunction || queuedSaveFunction;\n\n    try {\n      await this.executeSave(data, fn);\n      console.log(`✅ Aba \"${tabId}\" salva no Firebase`);\n      return true;\n    } catch (error) {\n      console.error(`❌ Erro ao salvar aba \"${tabId}\":`, error);\n      return false;\n    }\n  }\n\n  /**\n   * Executa salvamento no Firebase\n   */\n  async executeSave(data, saveFunction) {\n    if (typeof saveFunction === 'function') {\n      return await saveFunction(data);\n    }\n    throw new Error('saveFunction não é uma função válida');\n  }\n\n  /**\n   * Salva no localStorage (fallback)\n   */\n  saveToLocal(tabId, data) {\n    try {\n      const key = `admin_tab_${tabId}`;\n      localStorage.setItem(key, JSON.stringify({\n        data,\n        timestamp: Date.now()\n      }));\n    } catch (error) {\n      console.error('Erro ao salvar no localStorage:', error);\n    }\n  }\n\n  /**\n   * Carrega do localStorage\n   */\n  loadFromLocal(tabId) {\n    try {\n      const key = `admin_tab_${tabId}`;\n      const saved = localStorage.getItem(key);\n      \n      if (saved) {\n        const { data, timestamp } = JSON.parse(saved);\n        \n        // Verificar se dados não estão muito antigos (24h)\n        const age = Date.now() - timestamp;\n        if (age < 24 * 60 * 60 * 1000) {\n          return data;\n        }\n      }\n    } catch (error) {\n      console.error('Erro ao carregar do localStorage:', error);\n    }\n    \n    return null;\n  }\n\n  /**\n   * Salva todas as abas pendentes\n   */\n  async saveAll() {\n    const promises = [];\n    \n    for (const [tabId] of this.saveQueue) {\n      promises.push(this.save(tabId));\n    }\n\n    return await Promise.all(promises);\n  }\n\n  /**\n   * Limpa dados de uma aba\n   */\n  clearTab(tabId) {\n    this.stopPersistence(tabId, false);\n    \n    try {\n      const key = `admin_tab_${tabId}`;\n      localStorage.removeItem(key);\n    } catch (error) {\n      console.error('Erro ao limpar aba:', error);\n    }\n  }\n\n  /**\n   * Limpa todas as abas\n   */\n  clearAll() {\n    for (const [tabId] of this.saveQueue) {\n      this.clearTab(tabId);\n    }\n  }\n\n  /**\n   * Obtém indicador de última salvamento\n   */\n  getLastSaveTime(tabId) {\n    if (this.saveQueue.has(tabId)) {\n      return new Date(this.saveQueue.get(tabId).timestamp);\n    }\n    return null;\n  }\n}\n\n// Singleton\nexport const persistenceService = new PersistenceService();\n\n// Salvar tudo antes de sair\nwindow.addEventListener('beforeunload', () => {\n  persistenceService.saveAll();\n});\n\nexport default persistenceService;\n
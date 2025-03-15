/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Trabajo de Fin de Grado 2025
 *
 * @author Aday Cuesta Correa
 * @alias alu0101483887
 * @since 13 MARCH 2025
 *
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatHistoryManager from "./ChatHistoryManager";
//import DuckDuckGoSearch from "../InternetSearch/DuckDuckGoSearch";

class GeminiAIClient {
  private genAI: GoogleGenerativeAI;
  private historyManager: ChatHistoryManager;
  private instructions: string;
  //private searchEngine: DuckDuckGoSearch;

  constructor(apiKey: string, maxMessages: number = 10) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.historyManager = new ChatHistoryManager(maxMessages);
    //this.searchEngine = new DuckDuckGoSearch();
  
    this.instructions = `Eres un asistente que ayuda a personas mayores a navegar por internet y responder preguntas. 
    Debes usar un lenguaje simple y ser paciente. Antes de cada mensaje recibirás un historial de la conversación y, 
    cuando sea posible, información sobre la página visitada para que puedas ayudar mejor.`;
  }

  /*private shouldSearchOnline(prompt: string): boolean {
    // Criterios para determinar si el chatbot debe buscar en internet
    const lowerPrompt = prompt.toLowerCase();
    
    // Si la consulta contiene términos relacionados con hechos actuales, lugares, definiciones
    return lowerPrompt.includes('qué es') || lowerPrompt.includes('quién es') ||
           lowerPrompt.includes('dónde está') || lowerPrompt.includes('cuándo') || 
           lowerPrompt.includes('por qué') || lowerPrompt.includes('como') || lowerPrompt.includes('qué día');
  }*/

  private async getModel() {
    return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  public async sendMessage(prompt: string): Promise<string> {
    try {
      const model = await this.getModel();

      // Si el chatbot decide que la consulta debe ser buscada en línea
      /*if (this.shouldSearchOnline(prompt)) {
        const searchResults = await this.searchEngine.search(prompt);
        
        // Añadir la respuesta de búsqueda al historial
        this.historyManager.addMessage("Modelo", searchResults);
        return searchResults;
      }*/

      // Construcción del contexto con historial, instrucciones y nueva pregunta
      const context = this.instructions + "\n" + this.historyManager.getFormattedHistory() + `\nUsuario: ${prompt}`;
  
      const result = await model.generateContent(context);
      const response = result.response;
      const text = response.text();
  
      this.historyManager.addMessage("Usuario", prompt);
      this.historyManager.addMessage("Modelo", text);
  
      return text;
    } catch (error) {
      console.error("Error al ejecutar el modelo Gemini:", error);
      throw error;
    }
  }

  public clearChatHistory() {
    this.historyManager.clearHistory();
  }

  public getChatHistory() {
    return this.historyManager.getFormattedHistory();
  }
}

export default GeminiAIClient;
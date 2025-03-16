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
import FirebaseService  from '../Database/firebase';

class GeminiAIClient {
  private genAI: GoogleGenerativeAI;
  private historyManager: ChatHistoryManager;
  private instructions: string;
  private firebaseService: FirebaseService;

  constructor(apiKey: string, maxMessages: number = 10) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.historyManager = new ChatHistoryManager(maxMessages);
    this.firebaseService = new FirebaseService("Webpages", "tNmGunHlhU7TwsXeRxBH");
  
    this.instructions = `Eres un asistente que ayuda a personas mayores a navegar por internet paso a paso. Debes ser claro, paciente y nunca adelantar pasos.
    Cada vez que recibas un mensaje, tendrás el historial de la conversación y, si es posible, la información de la página en la que está el usuario. Usa esta información para guiarlo.
    Si está en la página principal, guíalo solo a hacer clic en 'Iniciar sesión'.
    Si está en la página de inicio de sesión, guíalo para que ingrese su usuario y contraseña, y luego haga clic en 'Acceder'.
    Siempre espera la confirmación del usuario antes de dar el siguiente paso.
    No asumas que el usuario sabe lo que debe hacer sin pedir confirmación.
    Sé paciente y ayuda a resolver dudas con explicaciones simples.`;
  }

  private async getModel() {
    return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  public async sendMessage(prompt: string): Promise<string> {
    try {
      const model = await this.getModel();

      // Construcción del contexto con historial, instrucciones, contexto de la página y nueva pregunta
      let context = `Instrucciones Iniciales: ${this.instructions}\n`;
      context += `Historial del chat: ${this.historyManager.getFormattedHistory()}\n`;
      // Borrar luego
      let data: string = await this.firebaseService.getData("https://www.cajasiete.com/");
      context += `Contexto de la página:${data}\n`;
      context += `Nuevo mensaje del Usuario: ${prompt}`;
  
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

  public getFirebaseService() {
    return this.firebaseService;
  }
}

export default GeminiAIClient;
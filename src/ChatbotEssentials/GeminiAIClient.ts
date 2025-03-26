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
import { readPrompts, getDomain } from "../Functions";

class GeminiAIClient {
  private genAI: GoogleGenerativeAI;
  private historyManager: ChatHistoryManager;
  private instructions: string;
  private actualDomain: string | null = null;

  /**
   * Creates an instance of the GeminiAIClient.
   * 
   * @param apiKey - The API key used to authenticate with the Google Generative AI service.
   * @param maxMessages - The maximum number of messages to keep in the chat history. Defaults to 10.
   * 
   * @remarks
   * This constructor initializes the GoogleGenerativeAI and ChatHistoryManager instances.
   * It also sets the instructions for the AI to assist elderly users in navigating the internet step by step.
   * The instructions emphasize clarity, patience, and waiting for user confirmation before proceeding.
   */
  constructor(apiKey: string, maxMessages: number = 10) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.historyManager = new ChatHistoryManager(maxMessages);
  
    this.instructions = `Eres un asistente que ayuda a personas mayores a navegar por internet paso a paso. Debes ser claro, paciente y evitar repetir confirmaciones innecesarias.
    Si el usuario confirma un paso, avanza al siguiente sin pedir confirmación adicional a menos que sea estrictamente necesario.
    Usa el historial de la conversación para mantener el contexto y no repitas información que ya ha sido confirmada.
    Sé paciente y ofrece explicaciones simples.`;
  }

  /**
   * Retrieves the generative model from the Gemini AI client.
   *
   * @returns {Promise<GenerativeModel>} A promise that resolves to the generative model.
   */
  private async getModel() {
    return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Sends a message to the Gemini AI model and returns the generated response.
   *
   * @param {string} prompt - The user's message to be sent to the model.
   * @param {string} [url=null] - Optional URL to fetch additional context data from prompts.json.
   * @returns {Promise<string>} - A promise that resolves to the model's response.
   * @throws Will throw an error if the model execution fails.
   */
  public async sendMessage(prompt: string, url: string = null): Promise<string> {
    try {
      const model = await this.getModel();

      let context = `Instrucciones Iniciales: ${this.instructions}\n`;
      context += `Historial del chat: ${this.historyManager.getFormattedHistory()}\n`;

      if (url) {
        const domain = getDomain(url);
        const data = await readPrompts('../Database/prompts.json');
        if (domain && data[domain]) {
          this.actualDomain = domain;
          if (data[domain][url]) {
            context += `Contexto de la página: ${JSON.stringify(data[domain][url])}\n`;
            console.log("Context added for URL:", data[domain][url]);
          }
        }
      } else if (this.actualDomain) {
        const data = await readPrompts('../Database/prompts.json');
        if (data[this.actualDomain]) {
          context += `Contexto del dominio: ${JSON.stringify(data[this.actualDomain])}\n`;
        }
      }
  
      context += `Nuevo mensaje del Usuario: ${prompt}`;
      const result = await model.generateContent(context);
      const response = result.response;
      const text = response.text();
  
      this.historyManager.addMessage("Usuario", prompt);
      this.historyManager.addMessage("Modelo", text);
  
      this.historyManager.saveHistoryToLocalStorage();
  
      return text;
    } catch (error) {
      console.error("Error al ejecutar el modelo Gemini:", error);
      throw error;
    }
  }

  /**
   * Clears the chat history by invoking the `clearHistory` method
   * of the `historyManager` instance.
   * 
   * @returns {void}
   */
  public clearChatHistory(): void {
    this.historyManager.clearHistory();
  }

  /**
   * Retrieves the formatted chat history.
   *
   * @returns {string} The formatted chat history.
   */
  public getChatHistory(): string {
    return this.historyManager.getFormattedHistory();
  }
}

export default GeminiAIClient;
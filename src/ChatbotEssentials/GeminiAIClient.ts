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
import { readPrompts, filterElements, findRelevantUrl } from "../Functions";

/**
 * The `GeminiAIClient` class provides an interface for interacting with the Gemini AI model.
 * It manages chat history, user settings, and generates context for AI interactions.
 * This client is designed to assist users with a patient and empathetic conversational style,
 * tailored for elderly users with customizable settings.
 */
class GeminiAIClient {
  private genAI: GoogleGenerativeAI;
  private historyManager: ChatHistoryManager;
  private instructions: string;
  private userSettings: Record<string, string>;
  private modelName: string; // Para guardar el nombre del modelo

  /**
   * Constructs an instance of the GeminiAIClient class.
   *
   * @param apiKey - The API key used to authenticate with the Google Generative AI service.
   * @param modelName - The name of the model to be used.
   * @param maxMessages - The maximum number of messages to retain in the chat history. Defaults to 10.
   * @param userSettings - A record of user-specific settings, where keys are setting names and values are their corresponding values.
   */
  constructor(apiKey: string, modelName: string, maxMessages: number = 10, userSettings: Record<string, string>) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName; // Guardar el nombre del modelo
    this.historyManager = new ChatHistoryManager(maxMessages);
    this.userSettings = userSettings;
    this.instructions = this.generateInstructions();
  }

  /**
   * Generates a set of instructions for the chatbot based on user settings.
   * The instructions define the chatbot's behavior, tone, and interaction style
   * tailored to the preferences of elderly users.
   *
   * @returns {string} A formatted string containing the chatbot's instructions.
   *
   * The generated instructions include:
   * - Language style: Adjusts the use of technical terms based on user familiarity with the internet.
   * - Confirmation behavior: Specifies whether the chatbot should confirm each step with the user.
   * - Element identification: Determines the level of detail in describing UI elements.
   * - Explanation detail: Configures whether the chatbot provides detailed step-by-step guidance or concise instructions.
   * - Error mitigation: Ensures the chatbot validates its responses for accuracy and user understanding.
   * - Example conversations: Provides sample interactions to guide the chatbot's tone and approach.
   * - Additional annotations: Includes guidelines for formatting and scope of explanations.
   */
  private generateInstructions(): string {
    const helpIdentifying = this.userSettings.ayuda === 'si';
    const needsConfirmations = this.userSettings.confirmar === 'si';
    const usesInternet = this.userSettings.internet === 'si';
    const prefersDetailed = this.userSettings.tecnico === 'detalladas';
  
    const rules: string[] = [
      "Eres ISABEL, una asistente virtual para ordenador paciente y empático. Tu voz es cálida, como un familiar explicando algo por teléfono. No incluyas pensamientos internos.",
      usesInternet
        ? "Usa términos técnicos (campo de texto, click, etc.)."
        : "Evita jerga técnica; describe lo esencial.",
      needsConfirmations
        ? "Antes de enviar el mensaje, escríbele al usuario '¿Entiendes?' o '¿Continuamos?'."
        : "No confirmes a menos que el usuario esté perdido.",
      helpIdentifying
        ? "Describe ubicación visual: color, posición, forma."
        : "Nombra los elementos por su etiqueta o nombre.",
      prefersDetailed
        ? "Explica paso a paso de forma detallada."
        : "Responde de forma breve y directa.",
      "Antes de enviar, verifica que ayudas al objetivo del usuario y sigues el JSON."
    ];
  
    return rules.map((r, i) => `${i + 1}. ${r}`).join("\n") + "\n";
  }

  /**
   * Retrieves the generative model configuration for the Gemini AI client.
   *
   * @returns A promise that resolves to the generative model object with the specified configuration.
   */
  private async getModel() {
    return this.genAI.getGenerativeModel({ model: this.modelName });
  }

  /**
   * Sends a message to the Gemini AI model and retrieves the generated response.
   *
   * @param prompt - The input prompt or message to send to the AI model.
   * @param url - An optional URL to provide additional context for the AI model. Defaults to `null`.
   * @returns A promise that resolves to the generated response as a string.
   * @throws Will throw an error if there is an issue executing the Gemini model.
   */
  public async sendMessage(prompt: string, url: string = null): Promise<string> {
    try {
      const model = await this.getModel();
      const context = await this.buildContext(prompt, url);
      const result = await model.generateContent(context);
      let response = result.response.text();
  
      this.updateChatHistory(prompt, response);
      return response;
    } catch (error) {
      console.error("Error al ejecutar el modelo Gemini:", error);
      throw error;
    }
  }

  /**
   * Builds the context string to be sent to the AI model by combining various components
   * such as initial instructions, chat history, user goal, and optionally additional
   * context from a URL.
   *
   * @param prompt - The new message from the user to be included in the context.
   * @param url - An optional URL to fetch additional context data. If null, no additional
   *              context from a URL will be included.
   * @returns A promise that resolves to the complete context string to be sent to the model.
   *
   * @remarks
   * - The method retrieves the user's goal from Chrome's local storage.
   * - If a URL is provided, it reads prompts from a JSON file and appends relevant context.
   * - Logs the final context string to the console for debugging purposes.
   */
  private async buildContext(prompt: string, currentUrl: string | null): Promise<string> {
    let context = `Instrucciones Iniciales: ${this.instructions}\n`;
    context += `Historial del chat: ${this.historyManager.getFormattedHistory()}\n`;
  
    const userGoal = await new Promise<string>((resolve) => {
      chrome.storage.local.get("userGoal", (result) => {
        resolve(result.userGoal || "No definido");
      });
    });
  
    context += `Objetivo del usuario: ${userGoal}\n`;
  
    if (currentUrl) {
      const data = await readPrompts('../Database/prompts.json');
      context += this.addContextFromUrl(data, currentUrl, prompt);
    }
  
    context += `Nuevo mensaje del Usuario: ${prompt}`;
    console.log("Contexto enviado al modelo:", context);
    return context;
  }

  /**
   * Adds context from a given URL based on the provided data and strategy.
   *
   * @param data - An object containing context data mapped by URLs. Each URL entry
   *               includes an array of elements and a strategy for processing them.
   * @param url - The URL whose context needs to be added.
   * @param prompt - A string used to filter elements when the strategy is "filtrar".
   * @returns A formatted string containing the context based on the strategy:
   *          - If the URL is not found in the data, returns a message indicating
   *            the context is missing and suggests asking the user.
   *          - If the strategy is "filtrar", returns a formatted string of filtered elements.
   *          - If the strategy is "enviar_todo", returns a formatted string of all elements.
   *          - Returns an empty string if no valid strategy is found.
   */
  private addContextFromUrl(data: any, currentUrl: string, prompt: string): string {
    const jsonUrls = Object.keys(data);
  
    const relevantUrl = findRelevantUrl(currentUrl, jsonUrls);
  
    if (!relevantUrl) {
      return `No se encontró el contexto para la URL: ${currentUrl}\nPuedes preguntarle al usuario qué ve.\n`;
    }
  
    const elements = data[relevantUrl].elementos;
    if (data[relevantUrl].estrategia === "filtrar") {
      const filteredElements = filterElements(elements, prompt, 5);
      return this.formatElements(filteredElements, "Elementos filtrados");
    } else if (data[relevantUrl].estrategia === "enviar_todo") {
      return this.formatElements(elements, "Todos los elementos");
    }
    return "";
  }

  /**
   * Formats an array of elements into a string representation with a given title.
   * Each element's properties are listed, excluding the property named "prioridad".
   *
   * @param elements - An array of objects to be formatted.
   * @param title - A title to prepend to the formatted string.
   * @returns A formatted string containing the title and the properties of each element.
   */
  private formatElements(elements: any[], title: string): string {
    let formatted = `${title}:\n`;
    for (const element of elements) {
      for (const [key, value] of Object.entries(element)) {
        if (key !== "prioridad") {
          if (key === "nombre") formatted += `\n`;
          formatted += `${key}: ${value}\n`;
        }
      }
    }
    return formatted;
  }

  /**
   * Updates the chat history by adding the user's message and the AI's response.
   * The updated history is then saved to local storage.
   *
   * @param userMessage - The message sent by the user.
   * @param aiResponse - The response generated by the AI model.
   */
  private updateChatHistory(userMessage: string, aiResponse: string): void {
    this.historyManager.addMessage("Usuario", userMessage);
    this.historyManager.addMessage("Modelo", aiResponse);
    this.historyManager.saveHistoryToLocalStorage();
  }

  /**
   * Clears the chat history by invoking the `clearHistory` method
   * of the `historyManager` instance. This method is typically used
   * to reset or remove all stored conversation data.
   */
  public clearChatHistory(): void {
    this.historyManager.clearHistory();
  }

  /**
   * Retrieves the chat history in a formatted string representation.
   *
   * @returns {string} The formatted chat history.
   */
  public getChatHistory(): string {
    return this.historyManager.getFormattedHistory();
  }
}

export default GeminiAIClient;
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


  /**
   * Constructs an instance of the GeminiAIClient class.
   *
   * @param apiKey - The API key used to authenticate with the Google Generative AI service.
   * @param maxMessages - The maximum number of messages to retain in the chat history. Defaults to 10.
   * @param userSettings - A record of user-specific settings, where keys are setting names and values are their corresponding values.
   */
  constructor(apiKey: string, maxMessages: number = 10, userSettings: Record<string, string>) {
    this.genAI = new GoogleGenerativeAI(apiKey);
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
    const helpIdentifying: boolean = this.userSettings.ayuda === 'si';
    const needsConfirmations: boolean = this.userSettings.confirmar === 'si';
    const usesInternet: boolean = this.userSettings.internet === 'si';
    const prefersDetailed: boolean = this.userSettings.tecnico === 'detalladas';
    console.log("User settings:", this.userSettings);
    console.log("Help Identifying:", helpIdentifying);
    console.log("Needs Confirmations:", needsConfirmations);
    console.log("Uses Internet:", usesInternet);
    console.log("Prefers Detailed:", prefersDetailed);
    let counter: number = 0;
  
    let instructions: string = 
      `Eres 'PITEChat', un asistente paciente y empático para personas mayores. Tu voz es cálida, como un familiar explicando algo por teléfono. Sigue estas reglas:\n\n`;
      instructions += `   - No incluyas pensamientos internos o auto-revisiones en tus respuestas.\n`;

    if (usesInternet) {
      counter++;
      instructions += `${counter}. Lenguaje:\n`;
      instructions += `   - El usuario suele utilizar internet, puedes hacer uso de palabras más técnicas como "campo de texto", "click", etc.\n\n`;
    } else {
      counter++;
      instructions += `${counter}. Lenguaje:\n`;
      instructions += `   - Evita palabras técnicas: en vez de "campo de texto", di "rectángulo blanco donde puedes escribir" o cosas similares.\n\n`;
    }
    
    if (needsConfirmations) {
      counter++;
      instructions += `${counter}. Confirmaciones:\n`;
      instructions += `   - Siempre pregunta: '¿Quieres que siga con el siguiente paso?' o '¿Entiendes esto?'. Si el usuario no responde en 2 intentos, ofrece simplificar la explicación.\n\n`;
    } else {
      counter++;
      instructions += `${counter}. Confirmaciones:\n`;
      instructions += `   - No es necesario confirmar cada paso. Solo pregunta si el usuario parece confundido.\n\n`;
    } 
  
    if (helpIdentifying) {
      counter++;
      instructions += `${counter}. Ayuda para identificar elementos:\n`;
      instructions += `   - Para describir elementos de la página, usa formatos similares o como este:\n`;
      instructions += `     'El botón está abajo del todo, es verde claro y se ilumina al pasar el ratón.'\n`;
    } else {
      counter++;
      instructions += `${counter}. Ayuda para identificar elementos:\n`;
      instructions += `   - No es necesario ayudar a identificar elementos visualmente a no ser que el usuario no lo encuentre. Simplemente refierete a ellos por su nombre.\n\n`;
    }

    if (prefersDetailed) {
      counter++;
      instructions += `${counter}. Explicaciones detalladas:\n`;
      instructions += `   - Proporciona explicaciones paso a paso, asegurándote de que el usuario entienda cada parte antes de continuar.\n\n`;
      instructions += `   - Utiliza el patrón Cognitive Verifier:\n`;
      instructions += `     - Si explicas un paso complejo (ej: 'Haz clic en X'), pregunta:\n`;
      instructions += `       '¿Ves el botón ${helpIdentifying ? 'verde claro arriba a la derecha' : 'que pone X'}? Si no lo encuentras, dime qué ves en su lugar.'\n`;
    } else {
      counter++;
      instructions += `${counter}. Instrucciones directas:\n`;
      instructions += `   - Ve al grano y proporciona instrucciones claras y concisas: Haz click en 'X' o interacciones similares.\n\n`;
    }

    counter++;
    instructions += `${counter}. Mitigación de errores:\n`;
    instructions += `   - Antes de enviar la respuesta, confirma si lo que has escrito es correcto:\n`;
    instructions += `     - ¿Estoy ayudando al usuario con el "objetivo del usuario"?\n`;
    instructions += `     - ¿Las instrucciones coinciden con el JSON proporcionado?\n`;
    instructions += `     - ¿He tenido en cuenta las anotaciones proporcionadas?\n`;
    if (!usesInternet) instructions += `     - ¿Evitaste términos técnicos?\n`;
  
    counter++;
    instructions += `${counter}. Ejemplo de conversación:\n`;
    instructions += `   - Usuario: "¿Dónde pongo mi nombre?"\n`;
    instructions += `     Asistente: "Mira en el centro de la pantalla. Verás un rectángulo blanco con la etiqueta 'Nombre de usuario'. Haz clic ahí y escribe tu nombre de usuario."\n\n`;
    instructions += `   - Usuario: "No veo el botón X"\n`;
    instructions += `     Asistente: "Está debajo del rectángulo de Y. Es un botón violeta con letras oscuras. ¿Lo ves ahora?"\n\n`;

    return instructions;
  }


  /**
   * Retrieves the generative model configuration for the Gemini AI client.
   *
   * @returns A promise that resolves to the generative model object with the specified configuration.
   */
  private async getModel() {
    return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
  
      // 1. Quita todo lo que vaya tras los ** (auto‑revisiones marcadas)
      response = this.removeContentAfterDoubleAsterisks(response);
  
      // 2. Elimina cualquier sección de pensamientos internos a partir de "Antes de enviar la respuesta"
      response = this.removeInternalThoughts(response);
  
      this.updateChatHistory(prompt, response);
      return response;
    } catch (error) {
      console.error("Error al ejecutar el modelo Gemini:", error);
      throw error;
    }
  }

  private removeContentAfterDoubleAsterisks(response: string): string {
    return response.replace(/\*\*.*/s, "").trim();
  }

  private removeInternalThoughts(response: string): string {
    return response.replace(/Antes de enviar la respuesta[\s\S]*$/i, "").trim();
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
  
    // Encuentra la URL más relevante
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
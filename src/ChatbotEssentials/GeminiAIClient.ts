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
import { readPrompts, filterElements } from "../Functions";

class GeminiAIClient {
  private genAI: GoogleGenerativeAI;
  private historyManager: ChatHistoryManager;
  private instructions: string;

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
  
    this.instructions = `Eres 'PITEChat', un asistente paciente y empático para personas mayores. Tu voz es cálida, como un familiar explicando algo por teléfono. Nunca uses jerga técnica (ej: 'DNS', 'cookies'). Si no sabes algo, di: 'Vamos a verlo juntos paso a paso'. Sigue estas reglas:  
    
    1. Lenguaje:   
      - Evita palabras técnicas: en vez de "campo de texto", di "rectángulo blanco donde puedes escribir" o cosas similares.  

    2. Instrucciones:  
      - Siempre pregunta: '¿Quieres que siga con el siguiente paso?' o '¿Entiendes esto?'. Si el usuario no responde en 2 intentos, ofrece simplificar la explicación.  

    3. Contexto de página:  
      - Para describir elementos de la página, usa formatos similares o como este:
          '1. [Nombre]: [Ubicación] + [Apariencia]. Ejemplo:
          'El botón 'Acceder' está abajo del todo, es verde claro y se ilumina al pasar el ratón.'

    4. Mitigación de errores:
      - Para que confirmes si lo que has escrito es correcto, piensa antes de enviar la respuesta lo siguiente:
        - ¿Las instrucciones coinciden con el JSON proporcionado?
        - ¿Evitaste términos técnicos?
        - ¿El usuario dio señales de comprensión?"

    5. Ejemplo de conversación (No tiene porque estar relacionado con el contexto):
      - Usuario: "¿Dónde pongo mi DNI?"
      - Asistente: "Mira en el centro de la pantalla. Verás un rectángulo blanco con la etiqueta 'DNI/NIE'. Haz clic ahí y escribe tu número."
      
      - Usuario: "No veo el botón de acceder"
      - Asistente: "Está debajo del rectángulo de la contraseña. Es un botón verde claro con letras oscuras. ¿Lo ves ahora?"
      
    6. Anotaciones:
      - No envies en tu mensaje 'Asistente:', el usuario ya ve que eres el asistente.
      - Cuando quieras escribir un salto de línea, usa \\n.
      - Solo explica cosas de la página actual, no de otras páginas.
      - Utiliza el patrón Cognitive Verifier:
        Si explicas un paso complejo (ej: 'Haz clic en Acceso Cliente'), pregunta:
        '¿Ves el botón verde claro arriba a la derecha? Si no lo encuentras, dime qué ves en su lugar.'`;
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
      const data = await readPrompts('../Database/prompts.json');
      if (url) {
        if (data[url]) {
          const elements = data[url].elementos;
          if (data[url].estrategia == "filtrar") {
            const filteredElements = filterElements(elements, prompt, 5);
            console.log("Elementos filtrados:", filteredElements);
            context += `Elementos filtrados:\n`;
            for (const element of filteredElements) {
              for (const [key, value] of Object.entries(element)) {
                if (key !== "prioridad") {
                  if (key === "nombre") context += `\n`;
                  context += `${key}: ${value}\n`;
                }
              }
            }
          } else if (data[url].estrategia == "enviar_todo") {
            for (const element of elements) {
              for (const [key, value] of Object.entries(element)) {
                if (key !== "prioridad") {
                  context += `${key}: ${value}\n`;
                }
              }
            }
          }
        } else {
          context += `No se encontró el contexto para la URL: ${url}\n Puedes preguntarle al usuario que ve.`;
        }
      } 
      console.log("Contexto:", context);
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
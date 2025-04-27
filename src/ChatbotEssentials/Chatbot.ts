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

import GeminiAIClient from '../ChatbotEssentials/GeminiAIClient';

/**
 * The `Chatbot` class represents a chatbot interface that interacts with the Gemini AI client.
 * It manages user input, sends messages to the AI client, and displays responses in a chatbox.
 * 
 * @remarks
 * This class is designed to be used within a web application context, specifically for a Chrome extension.
 * It handles user interactions, message storage, and chat history management.
 * 
 * @example
 * ```typescript
 * const chatbot = new Chatbot("YOUR_API_KEY", userSettings);
 * ```
 */
class Chatbot {
  private API_KEY: string;
  private AI_CLIENT: GeminiAIClient;
  private userSettings: Record<string, string>;
  private chatbox: HTMLDivElement;
  private userInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private ttsButton: HTMLButtonElement;
  private ttsEnabled: boolean = false;

  /**
   * Initializes the Chatbot instance with the provided API key and user settings.
   * 
   * @param apiKey - The API key for the Gemini AI client.
   * @param userSettings - An object containing user-specific settings for the chatbot.
   * 
   * @remarks
   * This constructor sets up the necessary DOM elements, loads messages from local storage,
   * and sets up event listeners for user interactions.
   */
  constructor(apiKey: string, userSettings: Record<string, string>) {
    this.API_KEY = apiKey;
    this.userSettings = userSettings;
    this.AI_CLIENT = new GeminiAIClient(this.API_KEY, 10, this.userSettings);

    this.initializeDOMElements();
    this.loadMessages();
    this.setupEventListeners();
  }

  /**
   * Initializes the DOM elements required for the chat interface.
   * 
   * @remarks
   * This method retrieves the chatbox, user input field, send button, and reset button from the DOM.
   * It also checks if these elements exist and logs an error if any are missing.
   */
  private initializeDOMElements(): void {
    this.chatbox = document.getElementById("chatbox") as HTMLDivElement;
    this.userInput = document.getElementById("userInput") as HTMLInputElement;
    this.sendButton = document.getElementById("sendButton") as HTMLButtonElement;
    this.resetButton = document.getElementById("resetButton") as HTMLButtonElement;
    this.ttsButton = document.getElementById("ttsButton") as HTMLButtonElement;


    if (!this.chatbox || !this.userInput || !this.sendButton || !this.resetButton || !this.ttsButton) {
      console.error("Error: No se encontraron los elementos necesarios en el DOM.");
      return;
    }
  }

  /**
   * Handles TTS button click to read the last bot message aloud
   */
  private handleTTS(): void {
    this.ttsEnabled = !this.ttsEnabled;
    this.ttsButton.classList.toggle('active-feature');

    if (this.ttsEnabled) {
      const botMessages = this.chatbox.querySelectorAll('.bot-message');
      if (botMessages.length > 0) {
        const lastBotMessage = botMessages[botMessages.length - 1];
        const text = lastBotMessage.querySelector('.content')?.textContent || '';
        this.speak(text);
      }
    }
  }

  /**
   * Uses the browser's speech synthesis to read text aloud
   * @param text - The text to be read
   */
  private speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9; // Velocidad ligeramente reducida para mayor claridad
      utterance.pitch = 1.2; // Tono un poco más alto para mejor audibilidad
      
      // Configuración de voz preferida para español
      const voices = speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.includes('es') && voice.name.includes('Natural')
      );
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      speechSynthesis.speak(utterance);
    } else {
      console.warn('La síntesis de voz no está soportada en este navegador');
      this.ttsButton.disabled = true;
      this.ttsButton.title = "Voz no soportada";
    }
  }

  /**
   * Loads messages from local storage and appends them to the chatbox.
   * 
   * @remarks
   * This method retrieves the stored messages using the Chrome extension API and appends each message
   * to the chatbox using the `appendMessage` method.
   */
  private loadMessages(): void {
    chrome.storage.local.get("messages", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error al cargar mensajes:", chrome.runtime.lastError);
        return;
      }

      const messages = result.messages || [];
      messages.forEach((msg: { sender: string, message: string }) => {
        this.appendMessage(msg.sender, msg.message);
      });
    });
  }

  /**
   * Sets up event listeners for user interactions with the chat interface.
   * 
   * @remarks
   * This method binds click and keypress events to the send button and user input field.
   * It also sets up a click event listener for the reset button to clear the chat history.
   */
  private setupEventListeners(): void {
    if (this.sendButton) {
      this.sendButton.addEventListener("click", () => this.handleSendMessage());
    } else {
      console.error("Error: No se encontró el botón de enviar.");
    }

    if (this.userInput) {
      this.userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") this.handleSendMessage();
      });
    } else {
      console.error("Error: No se encontró el campo de entrada del usuario.");
    }

    if (this.resetButton) {
      this.resetButton.addEventListener("click", () => this.resetChat(this.chatbox));
    } else {
      console.error("Error: No se encontró el botón de reinicio.");
    }

    if (this.ttsButton) {
      this.ttsButton.addEventListener("click", () => this.handleTTS());
    } else {
      console.error("Error: No se encontró el botón de TTS.");
    }
  
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => {
      };
    }
  }

  /**
   * Handles the sending of a message from the user to the AI client.
   * If a message is provided, it uses that; otherwise, it retrieves the value from the input field.
   * 
   * @param message - The message to be sent. If not provided, it will use the value from the input field.
   * 
   * @remarks
   * This method disables the send button, user input, and reset button while processing the request.
   * It retrieves the user's goal and current tab URL, sends the message to the AI client,
   * and appends both the user's message and AI's response to the chatbox.
   */
  private async handleSendMessage(message?: string): Promise<void> {
    const userMessage = message || this.userInput.value.trim();
    if (!userMessage) return;

    this.sendButton.disabled = true;
    this.userInput.disabled = true;
    this.resetButton.disabled = true;

    try {
      this.appendMessage("Tú", userMessage);
      if (!message) this.userInput.value = "";

      const userGoal = await new Promise<string>((resolve) => {
        chrome.storage.local.get("userGoal", (result) => {
          resolve(result.userGoal || "No definido");
        });
      });

      const url = await new Promise<string | null>((resolve) => this.getCurrentTabUrl(resolve));
      const response = await this.AI_CLIENT.sendMessage(`${userMessage}\nObjetivo del usuario: ${userGoal}`, url);
      this.appendMessage("Asistente", response);

      chrome.storage.local.get("messages", (result) => {
        const messages = result.messages || [];
        messages.push({ sender: "Tú", message: userMessage });
        messages.push({ sender: "Asistente", message: response });
        this.saveMessages(messages);
      });
    } catch (error) {
      console.error("Error en la IA:", error);
      this.appendMessage("Error", "No se pudo obtener respuesta. Inténtalo de nuevo más tarde.");
    } finally {
      this.sendButton.disabled = false;
      this.userInput.disabled = false;
      this.resetButton.disabled = false;
      this.userInput.focus();
    }
  }

  /**
   * Resets the chatbox by clearing its content and the chat history.
   * 
   * @param chatbox - The HTMLDivElement representing the chatbox to be reset.
   * 
   * @remarks
   * This method clears the inner HTML of the chatbox and resets the chat history in the AI client.
   * It also removes any stored messages from local storage using the Chrome extension API.
   */
  private resetChat(chatbox: HTMLDivElement): void {
    chatbox.innerHTML = "";
    this.AI_CLIENT.clearChatHistory();

    chrome.storage.local.remove("messages", () => {
      if (chrome.runtime.lastError) {
        console.error("Error al limpiar el chat:", chrome.runtime.lastError);
      }
    });
  }

  /**
   * Appends a message to the chatbox.
   * 
   * @param sender - The sender of the message (e.g., "Tú" or "Asistente").
   * @param message - The content of the message to be displayed.
   */
  public appendMessage(sender: string, message: string): void {
    const template = document.getElementById("message-template") as HTMLTemplateElement;
    if (!template) {
      console.error("Error: No se encontró la plantilla del mensaje.");
      return;
    }

    const messageElement = document.importNode(template.content, true);
    const senderElement = messageElement.querySelector(".sender") as HTMLElement;
    const contentElement = messageElement.querySelector(".content") as HTMLElement;

    if (!senderElement || !contentElement) {
      console.error("Error: No se encontraron los elementos de la plantilla.");
      return;
    }

    senderElement.textContent = sender;
    contentElement.textContent = message;

    if (sender === "Asistente" && this.ttsEnabled) {
      this.speak(message);
    }

    this.chatbox.appendChild(messageElement);
    this.chatbox.scrollTop = this.chatbox.scrollHeight;
  }

  /**
   * Retrieves the URL of the currently active tab in the current browser window.
   * 
   * @param callback - A callback function that receives the URL of the active tab as a string,
   *                   or `null` if the URL could not be retrieved.
   * 
   * @remarks
   * This method uses the Chrome Extensions API to query the active tab in the current window.
   * If an error occurs during the query or if no active tab with a valid URL is found, the callback
   * will be invoked with `null`.
   * 
   * @example
   * ```typescript
   * getCurrentTabUrl((url) => {
   *   if (url) {
   *     console.log("Active tab URL:", url);
   *   } else {
   *     console.error("Failed to retrieve the active tab URL.");
   *   }
   * });
   * ```
   */
  private getCurrentTabUrl(callback: (url: string | null) => void): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error al obtener la pestaña activa:", chrome.runtime.lastError);
        callback(null);
        return;
      }

      if (tabs.length === 0 || !tabs[0].url) {
        console.error("No se encontró la pestaña activa o no tiene URL.");
        callback(null);
        return;
      }

      const url = tabs[0].url;
      callback(url);
    });
  }

  /**
   * Saves an array of messages to the browser's local storage using the Chrome extension API.
   *
   * @param messages - An array of message objects, where each object contains:
   *   - `sender`: The sender of the message as a string.
   *   - `message`: The content of the message as a string.
   *
   * This method uses `chrome.storage.local.set` to store the messages. If an error occurs
   * during the storage operation, it logs the error to the console.
   */
  private saveMessages(messages: Array<{ sender: string, message: string }>): void {
    chrome.storage.local.set({ messages }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error al guardar mensajes:", chrome.runtime.lastError);
      }
    });
  }

  /**
   * Handles the event when a goal is successfully resolved.
   * Sends a predefined message indicating that the objective has been achieved.
   *
   */
  public handleGoalResolved(): void {
    const message = "Muchas gracias, he logrado mi objetivo";
    this.handleSendMessage(message);
  }
}

export default Chatbot;
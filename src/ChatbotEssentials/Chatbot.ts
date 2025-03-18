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


class Chatbot {
  private API_KEY: string;
  private AI_CLIENT: GeminiAIClient;
  private chatbox: HTMLDivElement;
  private userInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;

  /**
   * Creates an instance of the Chatbot class.
   * Initializes the AI client with the provided API key and sets up the necessary DOM elements and event listeners.
   *
   * @param {string} apiKey - The API key used to initialize the AI client.
   *
   * @remarks
   * This constructor waits for the DOM content to be fully loaded before attempting to access and initialize
   * the chatbox, user input, send button, and reset button elements. If any of these elements are not found,
   * an error is logged to the console.
   *
   * The constructor also calls the `loadMessages` and `setupEventListeners` methods to initialize the chat
   * history and set up the necessary event listeners for user interactions.
   */
  constructor(apiKey: string) {
    this.API_KEY = apiKey;
    this.AI_CLIENT = new GeminiAIClient(this.API_KEY);

    document.addEventListener("DOMContentLoaded", () => {
      this.chatbox = document.getElementById("chatbox") as HTMLDivElement;
      this.userInput = document.getElementById("userInput") as HTMLInputElement;
      this.sendButton = document.getElementById("sendButton") as HTMLButtonElement;
      this.resetButton = document.getElementById("resetButton") as HTMLButtonElement;

      if (!this.chatbox || !this.userInput || !this.sendButton) {
        console.error("Error: No se encontraron los elementos necesarios en el DOM.");
        return;
      }

      this.loadMessages();
      this.setupEventListeners();
    });
  }

  /**
   * Retrieves the URL of the currently active tab in the current window.
   * 
   * @param callback - A callback function that receives the URL of the active tab as a string, 
   *                   or null if there was an error or no active tab was found.
   * 
   * @remarks
   * This method uses the Chrome extension API to query the currently active tab in the current window.
   * If there is an error retrieving the tab or if no active tab is found, the callback will be invoked with `null`.
   * 
   * @example
   * ```typescript
   * getCurrentTabUrl((url) => {
   *   if (url) {
   *     console.log("Active tab URL:", url);
   *   } else {
   *     console.log("No active tab found or an error occurred.");
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
   * Saves an array of messages to the local Chrome storage.
   *
   * @param messages - An array of message objects, each containing a sender and a message.
   * @param messages[].sender - The sender of the message.
   * @param messages[].message - The content of the message.
   * @returns void
   */
  private saveMessages(messages: Array<{ sender: string, message: string }>): void {
    chrome.storage.local.set({ messages }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error al guardar mensajes:", chrome.runtime.lastError);
      }
    });
  }

  /**
   * Loads messages from the local Chrome storage and appends them to the chat.
   * 
   * This method retrieves the "messages" key from the local storage. If there is an error during the retrieval,
   * it logs the error to the console. If the retrieval is successful, it processes each message and appends it
   * to the chat using the `appendMessage` method.
   * 
   * @private
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
   * Appends a message to the chatbox.
   *
   * This method takes a sender and a message, creates a new message element
   * from a template, and appends it to the chatbox. It also ensures that the
   * chatbox scrolls to the bottom to display the new message.
   *
   * @param sender - The name of the sender of the message.
   * @param message - The content of the message to be appended.
   * @throws Will log an error to the console if the message template or its elements are not found.
   */
  private appendMessage(sender: string, message: string): void {
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
    this.chatbox.appendChild(messageElement);
    this.chatbox.scrollTop = this.chatbox.scrollHeight;
  }

  /**
   * Handles the sending of a message from the user input.
   * 
   * This method performs the following steps:
   * 1. Retrieves the trimmed user input message.
   * 2. Disables the send button, user input, and reset button.
   * 3. Appends the user's message to the chat.
   * 4. Retrieves the current tab URL.
   * 5. Sends the message to the AI client and appends the response to the chat.
   * 6. Stores the messages in local storage.
   * 7. Handles any errors that occur during the process.
   * 8. Re-enables the send button, user input, and reset button, and focuses on the user input.
   * 
   * @returns {Promise<void>} A promise that resolves when the message handling is complete.
   * @throws Will log an error message if the AI client fails to send a response.
   */
  private async handleSendMessage(): Promise<void> {
    const message = this.userInput.value.trim();
    if (!message) return;

    this.sendButton.disabled = true;
    this.userInput.disabled = true;
    this.resetButton.disabled = true;

    try {
      this.appendMessage("Tú", message);
      this.userInput.value = "";
      const url = await new Promise<string | null>((resolve) => this.getCurrentTabUrl(resolve));
      const response = await this.AI_CLIENT.sendMessage(message, url);
      this.appendMessage("Asistente", response);

      chrome.storage.local.get("messages", (result) => {
        const messages = result.messages || [];
        messages.push({ sender: "Tú", message });
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
   * Sets up event listeners for the chatbot interface.
   * 
   * This method attaches event listeners to the send button, user input field, 
   * and reset button to handle user interactions.
   * 
   * - The send button triggers the `handleSendMessage` method when clicked.
   * - The user input field triggers the `handleSendMessage` method when the Enter key is pressed.
   * - The reset button triggers the `resetChat` method to reset the chatbox.
   * 
   * @private
   * @method setupEventListeners
   * @returns {void}
   */
  private setupEventListeners(): void {
    this.sendButton.addEventListener("click", () => this.handleSendMessage());
    this.userInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.handleSendMessage();
    });
    this.resetButton.addEventListener("click", () => this.resetChat(this.chatbox));
  }

  /**
   * Resets the chat by clearing the chatbox content and removing the chat history.
   * 
   * @param chatbox - The HTMLDivElement representing the chatbox to be reset.
   * 
   * Clears the inner HTML of the chatbox, clears the AI client's chat history,
   * and removes the "messages" entry from Chrome's local storage.
   * 
   * Logs an error message to the console if there is an issue removing the "messages" entry.
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
}

export default Chatbot;
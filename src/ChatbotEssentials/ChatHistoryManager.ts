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

class ChatHistoryManager {
  private chatHistory: { role: "Usuario" | "Modelo"; message: string }[];
  private maxMessages: number;

  /**
   * Creates an instance of ChatHistoryManager.
   * 
   * @param {number} [maxMessages=9] - The maximum number of messages to store in the chat history.
   */
  constructor(maxMessages: number = 9) {
    this.chatHistory = [];
    this.maxMessages = maxMessages;
    this.loadHistoryFromLocalStorage();
  }

  /**
   * Adds a message to the chat history.
   * 
   * @param role - The role of the message sender, either "Usuario" (User) or "Modelo" (Model).
   * @param message - The content of the message to be added.
   * 
   * If the chat history exceeds the maximum number of messages, the oldest message is removed.
   * 
   * @returns {void}
   */
  public addMessage(role: "Usuario" | "Modelo", message: string): void {
    this.chatHistory.push({ role, message });
    if (this.chatHistory.length > this.maxMessages) this.chatHistory.shift();
  }

  /**
   * Returns the chat history formatted as a string.
   * Each message is prefixed with either "Usuario" or "Asistente" based on the role of the sender.
   *
   * @returns {string} The formatted chat history.
   */
  public getFormattedHistory(): string {
    return this.chatHistory
      .map((msg) => `${msg.role === "Usuario" ? "Usuario" : "Asistente"}: ${msg.message}`)
      .join("\n");
  }

  /**
   * Clears the chat history by resetting the chatHistory array to an empty array.
   * 
   * @returns {void}
   */
  public clearHistory(): void {
    this.chatHistory = [];
    this.saveHistoryToLocalStorage();
  }

  /**
   * Saves the chat history to local storage.
   * 
   * @returns {void}
   */
  public saveHistoryToLocalStorage(): void {
    chrome.storage.local.set({ chatHistory: this.chatHistory }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error al guardar el historial de chat:", chrome.runtime.lastError);
      }
    });
  }

  /**
   * Loads the chat history from local storage.
   * 
   * @returns {void}
   */
  public loadHistoryFromLocalStorage(): void {
    chrome.storage.local.get("chatHistory", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error al cargar el historial de chat:", chrome.runtime.lastError);
        return;
      }
      this.chatHistory = result.chatHistory || [];
    });
  }
}

export default ChatHistoryManager;
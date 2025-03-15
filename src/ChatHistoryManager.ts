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

  constructor(maxMessages: number = 9) {
    this.chatHistory = [];
    this.maxMessages = maxMessages;
  }

  public addMessage(role: "Usuario" | "Modelo", message: string) {
    this.chatHistory.push({ role, message });

    // Si el historial es demasiado grande, eliminar el más antiguo
    if (this.chatHistory.length > this.maxMessages) this.chatHistory.shift();
  }

  public getFormattedHistory(): string {
    return this.chatHistory
      .map((msg) => `${msg.role === "Usuario" ? "Usuario" : "Asistente"}: ${msg.message}`)
      .join("\n");
  }

  public clearHistory() {
    this.chatHistory = [];
  }
}

export default ChatHistoryManager;
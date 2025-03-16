"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ChatHistoryManager = /** @class */ (function () {
    function ChatHistoryManager(maxMessages) {
        if (maxMessages === void 0) { maxMessages = 9; }
        this.chatHistory = [];
        this.maxMessages = maxMessages;
    }
    ChatHistoryManager.prototype.addMessage = function (role, message) {
        this.chatHistory.push({ role: role, message: message });
        // Si el historial es demasiado grande, eliminar el más antiguo
        if (this.chatHistory.length > this.maxMessages)
            this.chatHistory.shift();
    };
    ChatHistoryManager.prototype.getFormattedHistory = function () {
        return this.chatHistory
            .map(function (msg) { return "".concat(msg.role === "Usuario" ? "Usuario" : "Asistente", ": ").concat(msg.message); })
            .join("\n");
    };
    ChatHistoryManager.prototype.clearHistory = function () {
        this.chatHistory = [];
    };
    return ChatHistoryManager;
}());
exports.default = ChatHistoryManager;

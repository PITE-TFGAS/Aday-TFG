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

class GeminiAIClient {
    private genAI: any;
    private chatHistory: string[];

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.chatHistory = [];
    }

    private async getModel() {
        return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    public async sendMessage(prompt: string): Promise<string> {
        try {
            const model = await this.getModel();
            const context = this.chatHistory.join("\n") + "\n" + prompt;

            const result = await model.generateContent(context);
            const response = await result.response;
            const text = response.text();

            this.chatHistory.push(`Usuario: ${prompt}`);
            this.chatHistory.push(`Modelo: ${text}`);

            return text;
        } catch (error) {
            console.error("Error al ejecutar el modelo Gemini:", error);
            throw error;
        }
    }

    public getChatHistory(): string[] {
        return this.chatHistory;
    }
}

export default GeminiAIClient;
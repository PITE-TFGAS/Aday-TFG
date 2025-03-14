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

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Reemplaza 'TU_API_KEY' con tu clave de API de Google AI Studio
const genAI = new GoogleGenerativeAI("AIzaSyCGnpOkebWUd1hLjc-ToU1FFS66veG3yMU");

let chatHistory: string[] = [];

async function runGeminiModel(prompt: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Concatenar el historial con el nuevo prompt
        const context = chatHistory.join("\n") + "\n" + prompt;

        let result = await model.generateContent(context);
        let response = await result.response;
        let text = response.text();

        console.log("Respuesta del modelo Gemini:", text);

        // Añadir el prompt y la respuesta al historial
        chatHistory.push(`Usuario: ${prompt}`);
        chatHistory.push(`Modelo: ${text}`);
    } catch (error) {
        console.error("Error al ejecutar el modelo Gemini:", error);
    }
}

// Ejemplo de uso
(async () => {
    await runGeminiModel("Cual es la capital de España?");
    await runGeminiModel("Que te acabo de preguntar?");
})();
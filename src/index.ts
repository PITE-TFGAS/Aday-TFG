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

import GeminiAIClient from './GeminiAIClient';
import { askQuestion, rl } from './Functions';

async function main() {
  const API_KEY: string = "AIzaSyCGnpOkebWUd1hLjc-ToU1FFS66veG3yMU";
  const AI_CLIENT: GeminiAIClient = new GeminiAIClient(API_KEY);

  console.log("Bienvenido al chat con el modelo de IA. Escribe 'exit' para salir.");

  while (true) {
    const userInput = await askQuestion("Tú: ");
    if (userInput.toLowerCase() === 'exit') {
      break;
    }

    try {
      const response = await AI_CLIENT.sendMessage(userInput);
      console.log("IA: " + response);
    } catch (error) {
      console.error("Error en la comunicación con el modelo:", error);
    }
  }

  console.log("Historial del chat:", AI_CLIENT.getChatHistory());
  rl.close();
}

main();
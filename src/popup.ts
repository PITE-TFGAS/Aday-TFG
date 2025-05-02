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

import Chatbot from './ChatbotEssentials/Chatbot';

let chatbot: Chatbot;

/**
 * Initializes the chatbot functionality and sets up event listeners for user interactions.
 * 
 * This function is executed once the DOM content is fully loaded. It performs the following tasks:
 * - Sets up a click event listener on the settings button to redirect to the settings page.
 * - Loads user settings from Chrome's local storage or uses default settings if none are found.
 * - Initializes the chatbot instance with an API key and user settings.
 * - Redirects to the settings page if no user settings are found in storage.
 * - Synchronizes the user goal input field with the stored value in Chrome's local storage.
 * - Updates the stored user goal whenever the input field value changes.
 * - Handles the resolution of the user goal by clearing the input field and invoking the chatbot's goal resolution handler.
 * 
 * @remarks
 * This function relies on the Chrome Extensions API (`chrome.storage.local`) for persistent storage.
 * It also assumes the existence of certain DOM elements with specific IDs:
 * - `settingsButton`: A button element for navigating to the settings page.
 * - `userGoal`: An input field for entering the user's goal.
 * - `resolveGoalButton`: A button element for resolving the user's goal.
 * 
 * @throws {Error} Logs an error if the chatbot instance is not initialized when resolving the goal.
 */
function setupChatbot() {
  document.addEventListener("DOMContentLoaded", () => {
    const settingsButton = document.getElementById("settingsButton") as HTMLButtonElement;

    if (settingsButton) {
      settingsButton.addEventListener("click", () => {
        window.location.href = "settings.html";
      });
    }

    const defaultSettings: Record<string, string> = {
      internet: "si",
      tecnico: "detallado",
      confirmar: "si",
      ayuda: "si",
    };

    chrome.storage.local.get("userSettings", (result) => {
      const API_KEY: string = "AIzaSyCGnpOkebWUd1hLjc-ToU1FFS66veG3yMU";
      const userSettings = result.userSettings || defaultSettings;

      chatbot = new Chatbot(API_KEY, userSettings);
      chatbot.appendMessage("Asistente",`¡Hola!, soy tu asistente virtual y voy a ayudarte en todo lo que pueda.\nPara empezar, escribe tu objetivo en el cuadro de texto de arriba, una vez lo hayas escrito puedes hablar conmigo utilizando el cuadro de texto y presionando la tecla Enter o el botón de enviar.\nUna vez hayas logrado tu objetivo, puedes presionar el botón de resolver objetivo para que yo lo elimine y puedas escribir otro objetivo.\nEspero que te ayude en todo lo que necesites. ¡Vamos a empezar!`);

      if (!result.userSettings) {
        console.warn("No se encontraron ajustes. Redirigiendo a la página de configuración...");
        window.location.href = "settings.html";
      }

    });

    const userGoalInput = document.getElementById("userGoal") as HTMLInputElement;
    const resolveGoalButton = document.getElementById("resolveGoalButton") as HTMLButtonElement;

    chrome.storage.local.get("userGoal", (result) => {
      userGoalInput.value = result.userGoal || "";
    });

    userGoalInput.addEventListener("input", () => {
      const userGoal = userGoalInput.value.trim();
      chrome.storage.local.set({ userGoal });
    });

    resolveGoalButton.addEventListener("click", () => {
      chrome.storage.local.set({ userGoal: "" }, () => {
        userGoalInput.value = "";
        if (chatbot) {
          chatbot.handleGoalResolved();
        } else {
          console.error("Error: El chatbot no está inicializado.");
        }
      });
    });
  });
}

setupChatbot();
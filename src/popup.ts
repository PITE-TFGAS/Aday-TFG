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
    const goalModal = document.getElementById("goalModal") as HTMLDivElement;
    const modalGoalInput = document.getElementById("modalGoalInput") as HTMLInputElement;
    const setGoalButton = document.getElementById("setGoalButton") as HTMLButtonElement;
    const goalDisplayArea = document.getElementById("goalDisplayArea") as HTMLDivElement;
    const goalDisplayText = document.getElementById("goalDisplayText") as HTMLSpanElement;
    const changeGoalButton = document.getElementById("changeGoalButton") as HTMLButtonElement;
    let currentGoal = "";

    const showModal = () => {
      modalGoalInput.value = currentGoal;
      goalModal.style.display = 'flex';
      goalDisplayArea.style.display = 'none';
      modalGoalInput.focus();
    };

    const hideModal = () => {
      goalModal.style.display = 'none';
      if (currentGoal) {
        goalDisplayArea.style.display = 'flex';
      }
    };

    const updateGoalDisplay = (goal: string) => {
      currentGoal = goal;
      goalDisplayText.textContent = goal || "Objetivo no definido";
      if (goal) {
        goalDisplayArea.style.display = 'flex';
      } else {
        goalDisplayArea.style.display = 'none';
      }
    };


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
    const defaultApiKey = "";
    const defaultApiModel = "gemini-1.5-flash-latest";

    Promise.all([
      new Promise<{ settings: Record<string, string>, fromStorage: boolean }>(resolve =>
        chrome.storage.local.get("userSettings", result => {
          const settingsExist = !!result.userSettings;
          resolve({ settings: result.userSettings || defaultSettings, fromStorage: settingsExist });
        })
      ),
      new Promise<string>(resolve =>
        chrome.storage.local.get("userGoal", result => resolve(result.userGoal || ""))
      ),
      new Promise<string>(resolve =>
        chrome.storage.local.get("geminiApiKey", result => resolve(result.geminiApiKey || defaultApiKey))
      ),
      new Promise<string>(resolve =>
        chrome.storage.local.get("geminiApiModel", result => resolve(result.geminiApiModel || defaultApiModel))
      )
    ]).then(([{ settings: userSettings, fromStorage: settingsFromStorage }, initialGoal, apiKey, apiModel]) => {

      if (!settingsFromStorage) {
        console.warn("No se encontraron ajustes guardados. Redirigiendo a la página de configuración...");
        window.location.href = "settings.html";
        return; 
      }

      if (!apiKey) {
        alert("API Key de Gemini no configurada. Por favor, configúrala en la página de Ajustes.");
        console.warn("API Key de Gemini no configurada. Redirigiendo a la página de configuración...");
        window.location.href = "settings.html";
        return;
      }

      chatbot = new Chatbot(apiKey, apiModel, userSettings);

      currentGoal = initialGoal;
      updateGoalDisplay(currentGoal); 

      if (!currentGoal) {
        showModal();
        chatbot.appendMessage("Asistente", `¡Hola! soy tu Asistente virtual y estoy aquí para ayudarte ^^. Dime, ¿en qué necesitas ayuda?.`);
      } else {
        hideModal();
      }

      setGoalButton.addEventListener("click", () => {
        const newGoal = modalGoalInput.value.trim();
        if (newGoal) {
          chrome.storage.local.set({ userGoal: newGoal }, () => {
            updateGoalDisplay(newGoal);
            hideModal();
          });
        } else {
          modalGoalInput.style.borderColor = 'red';
          setTimeout(() => { modalGoalInput.style.borderColor = '#ddd'; }, 1000);
        }
      });
      modalGoalInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          setGoalButton.click();
        }
      });
      changeGoalButton.addEventListener("click", showModal);

    }).catch(error => {
      console.error("Error al cargar datos iniciales:", error);
      alert("Error al cargar configuración. Intenta recargar la extensión.");
    });

  });
}

setupChatbot();
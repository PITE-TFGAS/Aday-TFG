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

import GeminiAIClient from './ChatbotEssentials/GeminiAIClient';

// Configuración de la clave de API (deberías considerar usar variables de entorno para esto)
const API_KEY: string = "AIzaSyCGnpOkebWUd1hLjc-ToU1FFS66veG3yMU";
const AI_CLIENT = new GeminiAIClient(API_KEY);

// Función para agregar un mensaje al chatbox
function appendMessage(chatbox: HTMLDivElement, sender: string, message: string): void {
  // Obtener la plantilla del mensaje
  const template = document.getElementById("message-template") as HTMLTemplateElement;
  if (!template) {
    console.error("Error: No se encontró la plantilla del mensaje.");
    return;
  }

  // Clonar la plantilla
  const messageElement = document.importNode(template.content, true);

  // Llenar la plantilla con los datos del mensaje
  const senderElement = messageElement.querySelector(".sender") as HTMLElement;
  const contentElement = messageElement.querySelector(".content") as HTMLElement;

  if (!senderElement || !contentElement) {
    console.error("Error: No se encontraron los elementos de la plantilla.");
    return;
  }

  senderElement.textContent = sender; // Asignar el remitente
  contentElement.textContent = message; // Asignar el contenido del mensaje

  // Agregar el mensaje al chatbox
  chatbox.appendChild(messageElement);

  // Auto-scroll al último mensaje
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Función para manejar el envío de mensajes
async function handleSendMessage(
  chatbox: HTMLDivElement,
  userInput: HTMLInputElement,
  sendButton: HTMLButtonElement
): Promise<void> {
  const message = userInput.value.trim();
  if (!message) return; // No hacer nada si el mensaje está vacío

  // Deshabilitar el botón y el input mientras se procesa la solicitud
  sendButton.disabled = true;
  userInput.disabled = true;

  try {
    appendMessage(chatbox, "Tú", message); // Mostrar el mensaje del usuario
    userInput.value = ""; // Limpiar el input
    const response = await AI_CLIENT.sendMessage(message); // Obtener respuesta de la IA
    appendMessage(chatbox, "Asistente", response); // Mostrar la respuesta del asistente
  } catch (error) {
    console.error("Error en la IA:", error);
    appendMessage(chatbox, "Error", "No se pudo obtener respuesta. Inténtalo de nuevo más tarde.");
  } finally {
    // Rehabilitar el botón y el input después de procesar la solicitud
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.focus(); // Enfocar el input para facilitar la siguiente interacción
  }
}

// Inicialización del chatbot
document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox") as HTMLDivElement;
  const userInput = document.getElementById("userInput") as HTMLInputElement;
  const sendButton = document.getElementById("sendButton") as HTMLButtonElement;
  if (!chatbox || !userInput || !sendButton) {
    console.error("Error: No se encontraron los elementos necesarios en el DOM.");
    return;
  }
  // Evento para enviar mensaje al hacer clic en el botón
  sendButton.addEventListener("click", () => handleSendMessage(chatbox, userInput, sendButton));
  // Evento para enviar mensaje al presionar "Enter" en el input
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") handleSendMessage(chatbox, userInput, sendButton);
  });
});
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

chrome.runtime.onInstalled.addListener(() => {
  console.log("Chatbot for elderly instalado!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AI_RESPONSE") {
    console.log("Recibida solicitud de respuesta IA:", message.text);
    sendResponse({ response: "Respuesta simulada de la IA" });
  }
});
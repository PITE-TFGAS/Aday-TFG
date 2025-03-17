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

console.log("Content script inyectado en la página");

chrome.runtime.sendMessage(
  { type: "GET_AI_RESPONSE", text: "Hola IA" },
  (response) => {
    console.log("Respuesta de la IA:", response.response);
  }
);
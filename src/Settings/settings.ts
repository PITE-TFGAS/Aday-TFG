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

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Retrieves the HTML form element with the ID "settingsForm".
   * This element is expected to be used for managing application settings.
   * 
   * @remarks
   * The returned element is cast to `HTMLFormElement | null` to ensure type safety.
   * If the element is not found in the DOM, the value will be `null`.
   * 
   * @example
   * ```typescript
   * const form = document.getElementById("settingsForm") as HTMLFormElement | null;
   * if (form) {
   *   form.addEventListener("submit", (event) => {
   *     event.preventDefault();
   *     // Handle form submission
   *   });
   * }
   * ```
   * 
   */
  const form = document.getElementById("settingsForm") as HTMLFormElement | null;
  const answers: Record<string, string> = {};

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("click", (event) => {
    const target = event.target as HTMLButtonElement;
    if (target.tagName === "BUTTON" && target.dataset.question && target.dataset.answer) {
      const question = target.dataset.question;
      const answer = target.dataset.answer;
      answers[question] = answer;

      // Highlight the selected button
      const buttons = form.querySelectorAll(`button[data-question="${question}"]`);
      buttons.forEach((button) => button.classList.remove("selected"));
      target.classList.add("selected");
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    chrome.storage.local.set({ userSettings: answers }, () => {
      window.location.href = "popup.html"; // Redirects to the chat popup
    });
  });
});
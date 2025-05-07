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
  const settingsForm = document.getElementById("settingsForm") as HTMLFormElement;
  const optionButtons = document.querySelectorAll(".option-button") as NodeListOf<HTMLButtonElement>;

  const apiConfigButton = document.getElementById("apiConfigButton") as HTMLButtonElement;
  const apiConfigModal = document.getElementById("apiConfigModal") as HTMLDivElement;
  const modalApiKeyInput = document.getElementById("modalApiKeyInput") as HTMLInputElement;
  const modalApiModelSelect = document.getElementById("modalApiModelSelect") as HTMLSelectElement;
  const saveApiConfigButton = document.getElementById("saveApiConfigButton") as HTMLButtonElement;
  const cancelApiConfigButton = document.getElementById("cancelApiConfigButton") as HTMLButtonElement;

  const defaultUserSettings: Record<string, string> = {
    internet: "si",
    tecnico: "detalladas",
    confirmar: "si",
    ayuda: "si",
  };

  const defaultApiConfig = {
    geminiApiKey: "",
    geminiApiModel: "gemini-1.5-flash-latest",
  };

  chrome.storage.local.get("userSettings", (result) => {
    const currentSettings = result.userSettings || defaultUserSettings;
    optionButtons.forEach((button) => {
      const question = button.dataset.question;
      const answer = button.dataset.answer;
      if (question && currentSettings[question] === answer) {
        button.classList.add("selected");
      }
    });
  });

  const loadApiConfig = () => {
    chrome.storage.local.get(["geminiApiKey", "geminiApiModel"], (result) => {
      modalApiKeyInput.value = result.geminiApiKey || defaultApiConfig.geminiApiKey;
      modalApiModelSelect.value = result.geminiApiModel || defaultApiConfig.geminiApiModel;
    });
  };
  loadApiConfig();

  apiConfigButton.addEventListener("click", () => {
    loadApiConfig();
    apiConfigModal.style.display = "flex";
  });

  cancelApiConfigButton.addEventListener("click", () => {
    apiConfigModal.style.display = "none";
  });

  saveApiConfigButton.addEventListener("click", () => {
    const apiKey = modalApiKeyInput.value.trim();
    const apiModel = modalApiModelSelect.value;

    if (!apiKey) {
      alert("Por favor, introduce una API Key.");
      modalApiKeyInput.focus();
      return;
    }

    chrome.storage.local.set({ geminiApiKey: apiKey, geminiApiModel: apiModel }, () => {
      console.log("Configuración de API guardada.");
      apiConfigModal.style.display = "none";
    });
  });

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;
      if (question) {
        document.querySelectorAll(`.option-button[data-question="${question}"]`).forEach((btn) => {
          btn.classList.remove("selected");
        });
        button.classList.add("selected");
      }
    });
  });

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newSettings: Record<string, string> = {};
    optionButtons.forEach((button) => {
      if (button.classList.contains("selected")) {
        const question = button.dataset.question;
        const answer = button.dataset.answer;
        if (question && answer) {
          newSettings[question] = answer;
        }
      }
    });

    chrome.storage.local.set({ userSettings: newSettings }, () => {
      console.log("Ajustes de usuario guardados.");
      window.location.href = "popup.html";
    });
  });
});
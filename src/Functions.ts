/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Trabajo de Fin de Grado 2025
 *
 * @autor Aday Cuesta Correa
 * @alias alu0101483887
 * @since 13 MARCH 2025
 *
 */

import { PageElement } from "./Interfaces/PageElement";

/**
 * Reads a JSON file from the specified file path and returns its contents.
 *
 * @param {string} filePath - The path to the JSON file to be read.
 * @returns {Promise<any>} A promise that resolves to the contents of the JSON file.
 * @throws Will throw an error if the file cannot be read or if the response is not ok.
 */
async function readPrompts(filePath: string): Promise<any> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Error al leer el archivo: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    throw error;
  }
}

const spanishStemmer = (word: string): string => {
  if (!word) return '';
  
  word = word.toLowerCase().trim();
  
  // Paso 1: Remover acentos y caracteres especiales
  word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Paso 2: Stemming básico (reglas comunes en español)
  const suffixes = [
    /(amiento|imientos|amiento|iciones|adoras|adores|ancias|ismos|ables|ibles|istas|adora|adores|ancias|ismos|ables|ibles|istas|ante|anza|ario|eros|endo|eras|ería|ese|és|eza|ezas|ico|ica|icos|icas|idad|idas|idos|iendo|iera|iero|ión|ismo|ista|ivo|ivos|izar|logía|mente|miento|ncia|ndo|nza|or|ora|orio|osa|oso|otas|ote|otos|sion|tad|tor|tora|tud|ura)$/,
    /(ar|er|ir|se|en|es|as|ís|an|in|do|ndo|ble|nte)$/,
  ];
  
  for (const suffix of suffixes) {
    if (suffix.test(word)) {
      word = word.replace(suffix, '');
      break;
    }
  }
  
  return word;
};

/**
 * Extracts keywords from a given text using stemming.
 *
 * @param text - The input text from which to extract keywords.
 * @returns An array of unique stemmed keywords.
 */
const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[.,¿?¡!]/g, ''));
    
  return [...new Set(words.map(spanishStemmer))];
};

/**
 * Filters elements based on user-provided keywords and sorts them by priority and match score.
 *
 * @param elements - An array of elements to filter.
 * @param userKeywords - An array of keywords provided by the user.
 * @param maxElements - The maximum number of elements to return. Defaults to 3.
 * @returns An array of filtered and sorted elements.
 */
function filterElements(
  elements: PageElement[],
  userText: string,
  maxElements = 3
): Partial<PageElement>[] {
  const userKeywords = extractKeywords(userText);

  return elements
    .map(element => {
      const elementKeywords = element.keywords?.map(kw =>
        extractKeywords(kw).join(' ')
      ) || [];

      // Increment match score for exact keyword matches
      const matchScore = userKeywords.reduce((score, userKw) => {
        const hasExactMatch = elementKeywords.some(elKw => elKw === userKw);
        const hasPartialMatch = elementKeywords.some(elKw =>
          elKw.includes(userKw)
        );
        return score + (hasExactMatch ? 3 : hasPartialMatch ? 1 : 0);
      }, 0);

      return { ...element, matchScore };
    })
    .filter(item => item.matchScore > 0) // Keep only elements with a positive match score
    .sort((a, b) =>
      b.matchScore - a.matchScore || // Sort by match score (descending)
      (a.prioridad || 0) - (b.prioridad || 0) // Then by priority (ascending)
    )
    .slice(0, maxElements)
    .map(element => {
      const filtered: Partial<PageElement> = {};
      element.incluir?.forEach(field => {
        if (field === 'nombre' || field === 'tipo' || 
            field === 'descripcion' || field === 'ubicacion' || 
            field === 'apariencia') {
          filtered[field] = element[field];
        }
      });
      return filtered;
    });
}

export { readPrompts, extractKeywords, filterElements };
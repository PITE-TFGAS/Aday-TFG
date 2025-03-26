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

/**
 * Extracts the domain (hostname) from a given URL.
 *
 * @param url - The URL string from which to extract the domain.
 * @returns The domain (hostname) of the URL. Returns an empty string if the URL is invalid.
 * @throws Will log an error message to the console if the URL is invalid.
 */
function getDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (error) {
    console.error("Error al obtener el dominio de la URL:", error);
    return "";
  }
}

export { readPrompts, getDomain };
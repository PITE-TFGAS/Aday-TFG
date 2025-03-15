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

import axios from 'axios';

class DuckDuckGoSearch {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'https://api.duckduckgo.com/';
  }

  public async search(query: string): Promise<string> {
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          q: query,              // El término de búsqueda
          format: 'json',        // Formato de la respuesta (JSON)
          no_redirect: '1',      // Evita redirigir al usuario
          no_html: '1',          // Evita contenido HTML en la respuesta
          skip_disambig: '1',   // Evita la página de desambiguación
        }
      });

      const answer = response.data.AbstractText || 'Lo siento, no pude encontrar la información.';
      return answer;
    } catch (error) {
      console.error('Error al realizar la búsqueda en DuckDuckGo:', error);
      return 'Lo siento, ocurrió un error al buscar la información.';
    }
  }
}

export default DuckDuckGoSearch;
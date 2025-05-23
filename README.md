# Extensión Gemini para Navegadores Chromium

Este repositorio contiene una extensión de navegador desarrollada en **TypeScript** que actúa como asistente inteligente para la navegación web, especialmente diseñada para facilitar el uso de páginas complejas a personas mayores. Funciona mediante la integración con **modelos Gemini de Google**, a los que se accede mediante una API Key personalizada.

La extensión analiza el contenido de las páginas web y genera respuestas guiadas paso a paso, adaptadas a las necesidades del usuario, aprovechando las capacidades de generación de lenguaje natural de Gemini.

## Instalación

1. **Descarga el repositorio**  
   Puedes clonar este repositorio o descargarlo como archivo ZIP y descomprimirlo en tu equipo.

2. **Instala las dependencias**  
   Abre una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   ```

3. **Compila la extensión**  
   Para construir la extensión, ejecuta:
   ```bash
   npm run build
   ```

4. **Carga la extensión en tu navegador Chromium**  
   - Abre tu navegador (Chrome, Edge, Brave, etc.).
   - Ve a `chrome://extensions/`.
   - Activa el modo para desarrolladores.
   - Arrastra la carpeta `dist` generada tras la compilación al área de extensiones para cargar la extensión.

## Primer uso

Al abrir la extensión por primera vez, se te pedirá que elijas uno de los modelos de Gemini disponibles e introduzcas tu propia API Key para comenzar a utilizarla.

## Tecnologías utilizadas

- **TypeScript** (principal lenguaje de desarrollo)
- **HTML** y **JavaScript** (para la interfaz de usuario y funcionalidades adicionales)
- Herramientas de construcción y gestión de dependencias con **npm**

## Contribución

Si deseas contribuir, abre un _issue_ o realiza un _pull request_ con tus sugerencias y mejoras.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.

---

Desarrollado por [AdayCuestaCorrea](https://github.com/AdayCuestaCorrea)

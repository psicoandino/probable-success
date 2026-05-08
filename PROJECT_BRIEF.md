# Brief de proyecto

## Diagnóstico

El `index.html` original era un MVT visual: mostraba una estética oscura, una grilla editorial y tres secciones temáticas, pero las notas estaban incrustadas en el HTML, los enlaces no tenían interacción real y el contenido dummy podía confundirse con noticias publicadas.

El `agent.txt` proponía correctamente pasar de maqueta a sistema mediante una arquitectura estática y desacoplada: el backend genera un JSON y la interfaz lo consume. Esa decisión es sólida para GitHub Pages porque reduce costo, superficie de fallo y dependencia de infraestructura.

## Decisión editorial y técnica

La versión final debe comportarse como un briefing de inteligencia pública, no como un blog ni como una landing page. La experiencia principal es:

- lectura rápida de una nota destacada,
- filtro inmediato por categoría,
- apertura de análisis en panel lateral,
- enlace secundario a fuente original,
- contenido reemplazable desde `data/latest_news.json`.

Esta estructura preserva contexto: el usuario no pierde su posición en la grilla cuando abre una nota.

## Contrato de contenido

Cada nota necesita:

- `id`: identificador estable,
- `title`: titular editorial,
- `category`: slug usado por filtros,
- `categoryLabel`: etiqueta visible,
- `source`: origen o tipo de síntesis,
- `publishedLabel`: fecha legible,
- `readingTime`: tiempo estimado,
- `priority`: prioridad editorial,
- `image`: ruta de imagen,
- `dek`: bajada,
- `summary`: síntesis principal,
- `keyPoints`: lista de claves,
- `localAngle`: ángulo chileno o territorial,
- `originalUrl`: fuente primaria.

## Reglas periodísticas mínimas

- No publicar cifras o afirmaciones operativas sin fuente verificable.
- Separar noticia, síntesis y opinión analítica.
- Mantener enlaces a fuentes primarias cuando existan.
- Marcar claramente datasets de prueba.
- Evitar titulares que conviertan una promesa tecnológica en hecho consumado.

## Próximo salto

Cuando el pipeline exista, el backend debería producir `latest_news.json` en una rama o carpeta pública. La interfaz no necesita conocer Python, scraping ni NLP: solo leer el JSON final.

# Soberanía Digital

Interfaz estática para un briefing de inteligencia pública. El sitio está preparado para GitHub Pages y funciona sin framework: `index.html` carga estilos, lógica de interacción y un archivo JSON con las notas procesadas.

## Estructura

```text
.
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── img/
│   └── js/app.js
├── data/latest_news.json
├── PROJECT_BRIEF.md
└── agent.txt
```

## Datos

`data/latest_news.json` es el contrato entre el backend editorial y la interfaz. Cuando exista el scraper/NLP, debe reemplazar ese archivo con notas verificadas manteniendo los mismos campos.

El dataset actual está marcado como `Demo`; no debe tratarse como cobertura periodística real.

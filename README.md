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

## Desarrollo local

Sirve la carpeta por HTTP para que el navegador pueda cargar `data/latest_news.json`:

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Publicación en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube esta carpeta al branch principal.
3. En GitHub, entra a `Settings > Pages`.
4. Elige `Deploy from a branch`.
5. Selecciona `main` y la carpeta `/root`.

## Datos

`data/latest_news.json` es el contrato entre el backend editorial y la interfaz. Cuando exista el scraper/NLP, debe reemplazar ese archivo con notas verificadas manteniendo los mismos campos.

El dataset actual está marcado como `Demo`; no debe tratarse como cobertura periodística real.

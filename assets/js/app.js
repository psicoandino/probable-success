const state = {
    articles: [],
    currentCategory: "all",
    activeArticleId: null
};

const categoryLabels = {
    all: "Todas las secciones",
    "recursos-energia": "Recursos & Energía",
    "salud-educacion": "Salud & Educación",
    "estado-seguridad": "Estado & Seguridad"
};

const legacyHashMap = {
    energia: "recursos-energia",
    salud: "salud-educacion",
    seguridad: "estado-seguridad"
};

const els = {
    navLinks: [...document.querySelectorAll("[data-category]")],
    featuredArticle: document.querySelector("#featuredArticle"),
    updatedAt: document.querySelector("#updatedAt"),
    coverageCount: document.querySelector("#coverageCount"),
    datasetMode: document.querySelector("#datasetMode"),
    activeCategoryLabel: document.querySelector("#activeCategoryLabel"),
    feedCount: document.querySelector("#feedCount"),
    newsGrid: document.querySelector("#newsGrid"),
    emptyState: document.querySelector("#emptyState"),
    readerPanel: document.querySelector("#readerPanel"),
    panelBackdrop: document.querySelector("#panelBackdrop"),
    closePanel: document.querySelector("#closePanel"),
    readerMeta: document.querySelector("#readerMeta"),
    readerTitle: document.querySelector("#readerTitle"),
    readerDek: document.querySelector("#readerDek"),
    readerSource: document.querySelector("#readerSource"),
    readerTime: document.querySelector("#readerTime"),
    readerPriority: document.querySelector("#readerPriority"),
    readerSummary: document.querySelector("#readerSummary"),
    readerKeyPoints: document.querySelector("#readerKeyPoints"),
    readerLocalAngle: document.querySelector("#readerLocalAngle"),
    readerOriginal: document.querySelector("#readerOriginal")
};

async function boot() {
    bindEvents();

    try {
        const response = await fetch("data/latest_news.json", { cache: "no-cache" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        state.articles = data.articles ?? [];
        els.updatedAt.textContent = formatDate(data.updatedAt);
        els.coverageCount.textContent = `${state.articles.length} notas`;
        els.datasetMode.textContent = data.mode ?? "Demo";
        setCategory(getCategoryFromHash(), false);
    } catch (error) {
        renderLoadError(error);
    }
}

function bindEvents() {
    els.navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const category = link.dataset.category;

            if (!category) return;

            event.preventDefault();
            setCategory(category, true);
        });
    });

    els.newsGrid.addEventListener("click", (event) => {
        const card = event.target.closest("[data-article-id]");
        if (card) openArticle(card.dataset.articleId);
    });

    els.newsGrid.addEventListener("keydown", (event) => {
        const card = event.target.closest("[data-article-id]");
        if (!card || !["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        openArticle(card.dataset.articleId);
    });

    els.closePanel.addEventListener("click", closeArticle);
    els.panelBackdrop.addEventListener("click", closeArticle);

    window.addEventListener("hashchange", () => {
        setCategory(getCategoryFromHash(), false);
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && els.readerPanel.classList.contains("is-open")) {
            closeArticle();
        }
    });
}

function getCategoryFromHash() {
    const rawHash = window.location.hash.replace("#", "");
    const category = legacyHashMap[rawHash] ?? rawHash;
    return categoryLabels[category] ? category : "all";
}

function setCategory(category, updateUrl) {
    state.currentCategory = categoryLabels[category] ? category : "all";

    if (updateUrl) {
        window.history.pushState(null, "", `#${state.currentCategory}`);
    }

    updateNav();
    renderFeatured();
    renderGrid();
}

function updateNav() {
    els.navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.category === state.currentCategory);
    });

    els.activeCategoryLabel.textContent = categoryLabels[state.currentCategory];
}

function getVisibleArticles() {
    if (state.currentCategory === "all") return state.articles;
    return state.articles.filter((article) => article.category === state.currentCategory);
}

function renderFeatured() {
    const visible = getVisibleArticles();
    const article = visible.find((item) => item.featured) ?? visible[0];

    if (!article) {
        els.featuredArticle.style.removeProperty("--lead-image");
        els.featuredArticle.innerHTML = `
            <div class="story-kicker">Sin cobertura</div>
            <h1>No hay notas disponibles</h1>
            <p>El archivo de datos no contiene entradas para esta sección.</p>
        `;
        return;
    }

    els.featuredArticle.style.setProperty("--lead-image", `url("${article.image}")`);
    els.featuredArticle.innerHTML = "";

    const kicker = document.createElement("div");
    kicker.className = "story-kicker";
    kicker.textContent = `Destacado // ${article.categoryLabel}`;

    const title = document.createElement("h1");
    title.textContent = article.title;

    const dek = document.createElement("p");
    dek.textContent = article.dek;

    const actions = document.createElement("div");
    actions.className = "lead-actions";

    const button = document.createElement("button");
    button.className = "button";
    button.type = "button";
    button.textContent = "Abrir análisis";
    button.addEventListener("click", () => openArticle(article.id));

    actions.append(button);
    els.featuredArticle.append(kicker, title, dek, actions);
}

function renderGrid() {
    const visible = getVisibleArticles();
    els.newsGrid.replaceChildren();
    els.feedCount.textContent = `${visible.length} ${visible.length === 1 ? "nota" : "notas"}`;
    els.emptyState.hidden = visible.length > 0;

    visible.forEach((article) => {
        els.newsGrid.append(createCard(article));
    });
}

function createCard(article) {
    const card = document.createElement("article");
    card.className = "article-card";
    card.dataset.articleId = article.id;
    card.tabIndex = 0;
    card.role = "button";
    card.setAttribute("aria-label", `Abrir análisis: ${article.title}`);

    const image = document.createElement("div");
    image.className = "card-image";
    image.style.setProperty("--card-image", `url("${article.image}")`);
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", article.imageAlt ?? article.title);

    const body = document.createElement("div");
    body.className = "card-body";

    const category = document.createElement("div");
    category.className = "card-category";
    category.textContent = article.categoryLabel;

    const title = document.createElement("h3");
    title.textContent = article.title;

    const excerpt = document.createElement("p");
    excerpt.className = "card-excerpt";
    excerpt.textContent = article.dek;

    const meta = document.createElement("div");
    meta.className = "card-meta";

    const source = document.createElement("span");
    source.textContent = article.source;

    const date = document.createElement("span");
    date.textContent = article.publishedLabel;

    meta.append(source, date);
    body.append(category, title, excerpt, meta);
    card.append(image, body);

    return card;
}

function openArticle(articleId) {
    const article = state.articles.find((item) => item.id === articleId);
    if (!article) return;

    state.activeArticleId = articleId;
    els.readerMeta.textContent = `${article.categoryLabel} // ${article.publishedLabel}`;
    els.readerTitle.textContent = article.title;
    els.readerDek.textContent = article.dek;
    els.readerSource.textContent = article.source;
    els.readerTime.textContent = article.readingTime;
    els.readerPriority.textContent = article.priority;
    els.readerSummary.textContent = article.summary;
    els.readerLocalAngle.textContent = article.localAngle;
    els.readerKeyPoints.replaceChildren();

    article.keyPoints.forEach((point) => {
        const item = document.createElement("li");
        item.textContent = point;
        els.readerKeyPoints.append(item);
    });

    if (article.originalUrl) {
        els.readerOriginal.href = article.originalUrl;
        els.readerOriginal.removeAttribute("aria-disabled");
    } else {
        els.readerOriginal.href = "#";
        els.readerOriginal.setAttribute("aria-disabled", "true");
    }

    document.body.classList.add("panel-open");
    els.panelBackdrop.hidden = false;
    els.readerPanel.classList.add("is-open");
    els.readerPanel.setAttribute("aria-hidden", "false");
    els.closePanel.focus();
}

function closeArticle() {
    state.activeArticleId = null;
    document.body.classList.remove("panel-open");
    els.readerPanel.classList.remove("is-open");
    els.readerPanel.setAttribute("aria-hidden", "true");
    els.panelBackdrop.hidden = true;
}

function formatDate(value) {
    if (!value) return "--";

    return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

function renderLoadError(error) {
    els.featuredArticle.style.removeProperty("--lead-image");
    els.featuredArticle.innerHTML = `
        <div class="story-kicker">Error de datos</div>
        <h1>No se pudo cargar el briefing</h1>
        <p>Revisa que el sitio se esté sirviendo por HTTP y que exista data/latest_news.json.</p>
    `;
    els.updatedAt.textContent = "--";
    els.coverageCount.textContent = "0 notas";
    els.feedCount.textContent = "0 notas";
    els.emptyState.hidden = false;
    els.emptyState.textContent = `Error: ${error.message}`;
}

boot();

document.addEventListener("DOMContentLoaded", function () {
    const previewEmpty = document.getElementById("preview-empty");
    const previewFilled = document.getElementById("preview-filled");
    const previewMediaWrap = document.getElementById("preview-media-wrap");
    const previewTitle = document.getElementById("preview-title");
    const previewCategory = document.getElementById("preview-category");
    const previewTags = document.getElementById("preview-tags");
    const previewDescription = document.getElementById("preview-description");
    const previewOpenBtn = document.getElementById("preview-open-btn");

    let selectedUrl = null;

    function getCurrentLang() {
        return localStorage.getItem("language") || "es";
    }

    function getTranslation(key) {
        if (typeof translations !== "undefined") {
            const lang = getCurrentLang();
            return (translations[lang] && translations[lang][key]) || key;
        }
        return key;
    }

    function updatePreviewDescription() {
        if (!previewDescription || !previewDescription.dataset.descKey) return;
        const desc = getTranslation(previewDescription.dataset.descKey);
        previewDescription.innerHTML = desc;
    }

    function updatePreviewCategory() {
        if (!previewCategory || !previewCategory.dataset.categoryKey) return;
        const cat = getTranslation(previewCategory.dataset.categoryKey);
        previewCategory.textContent = cat.toUpperCase();
    }

    function showPreview(item) {
        const title = item.getAttribute("data-title");
        const categoryKey = item.getAttribute("data-category-key");
        const tags = (item.getAttribute("data-tags") || "").split(",").filter(Boolean);
        const previewType = item.getAttribute("data-preview-type");
        const previewSrc = item.getAttribute("data-preview-src");
        const descKey = item.getAttribute("data-desc-key");
        const url = item.getAttribute("data-url");

        selectedUrl = url;

        previewTitle.textContent = title;

        previewCategory.dataset.categoryKey = categoryKey;
        updatePreviewCategory();

        previewTags.innerHTML = tags.map(t =>
            `<span class="preview-tag">${t}</span>`
        ).join("");

        previewDescription.dataset.descKey = descKey;
        updatePreviewDescription();

        previewMediaWrap.innerHTML = "";
        if (previewSrc) {
            if (previewType === "video") {
                const video = document.createElement("video");
                video.src = previewSrc;
                video.controls = false;
                video.muted = true;
                video.autoplay = true;
                video.loop = true;
                video.style.width = "100%";
                video.style.height = "100%";
                video.style.objectFit = "cover";
                previewMediaWrap.appendChild(video);
            } else {
                const img = document.createElement("img");
                img.src = previewSrc;
                img.alt = title;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "cover";
                previewMediaWrap.appendChild(img);
            }
        }

        previewEmpty.style.display = "none";
        previewFilled.style.display = "flex";
    }

    function openProject() {
        if (!selectedUrl) return;
        window.parent.postMessage({
            command: "add_window",
            url: selectedUrl,
            arg: { title: previewTitle.textContent, width: 900, height: 600, icon: "../img/documents.png" }
        }, "*");
    }

    document.querySelectorAll(".carpeta-item").forEach((item) => {
        item.addEventListener("click", function () {
            document.querySelectorAll(".carpeta-item").forEach(e => e.classList.remove("selected"));
            this.classList.add("selected");
            showPreview(this);
        });

        item.addEventListener("dblclick", function () {
            openProject();
        });
    });

    if (previewOpenBtn) {
        previewOpenBtn.addEventListener("click", openProject);
    }

    // Sidebar category links → scroll to section
    const linkDesarrollo = document.getElementById("link-desarrollo");
    const linkLaborales = document.getElementById("link-laborales");
    const linkPrototipos = document.getElementById("link-prototipos");
    const linkAll = document.getElementById("link-all");
    const xpContent = document.getElementById("xp-content");

    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el && xpContent) {
            xpContent.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
        }
    }

    if (linkDesarrollo) linkDesarrollo.addEventListener("click", e => { e.preventDefault(); scrollToSection("section-desarrollo"); });
    if (linkLaborales) linkLaborales.addEventListener("click", e => { e.preventDefault(); scrollToSection("section-laborales"); });
    if (linkPrototipos) linkPrototipos.addEventListener("click", e => { e.preventDefault(); scrollToSection("section-prototipos"); });
    if (linkAll) linkAll.addEventListener("click", e => { e.preventDefault(); if (xpContent) xpContent.scrollTo({ top: 0, behavior: "smooth" }); });

    // Desktop/MyDocs links close the window or focus parent
    const linkDesktop = document.getElementById("link-desktop");
    const linkMyDocs = document.getElementById("link-mydocs");
    if (linkDesktop) linkDesktop.addEventListener("click", e => { e.preventDefault(); window.parent.postMessage({ command: "minimize" }, "*"); });
    if (linkMyDocs) linkMyDocs.addEventListener("click", e => { e.preventDefault(); });

    // Re-translate preview when language changes
    window.addEventListener("languageChanged", function () {
        updatePreviewDescription();
        updatePreviewCategory();

        // Update category name in sidebar labels via data-translate (handled by language.js)
        // Update folder names via data-translate (handled by language.js)
    });
});

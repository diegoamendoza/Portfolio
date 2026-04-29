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

    // --- Lightbox ---
    const lightbox = document.createElement("div");
    lightbox.id = "preview-lightbox";
    lightbox.innerHTML = `
        <div id="preview-lightbox-inner">
            <button id="preview-lb-close" title="Cerrar">&times;</button>
            <button id="preview-lb-prev" title="Anterior"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button>
            <img id="preview-lb-img" src="" alt="">
            <button id="preview-lb-next" title="Siguiente"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </div>`;
    document.body.appendChild(lightbox);

    const lbImg   = document.getElementById("preview-lb-img");
    const lbClose = document.getElementById("preview-lb-close");
    const lbPrev  = document.getElementById("preview-lb-prev");
    const lbNext  = document.getElementById("preview-lb-next");

    let lbImages = [];
    let lbIndex  = 0;

    function openLightbox(images, index) {
        lbImages = images;
        lbIndex  = index;
        lbImg.src = lbImages[lbIndex];
        lightbox.classList.add("active");
        lbPrev.style.display = lbImages.length > 1 ? "" : "none";
        lbNext.style.display = lbImages.length > 1 ? "" : "none";
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lbImg.src = "";
    }

    lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e) { if (e.target === lightbox) closeLightbox(); });

    lbPrev.addEventListener("click", function(e) {
        e.stopPropagation();
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        lbImg.src = lbImages[lbIndex];
    });

    lbNext.addEventListener("click", function(e) {
        e.stopPropagation();
        lbIndex = (lbIndex + 1) % lbImages.length;
        lbImg.src = lbImages[lbIndex];
    });

    document.addEventListener("keydown", function(e) {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft")  { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; lbImg.src = lbImages[lbIndex]; }
        if (e.key === "ArrowRight") { lbIndex = (lbIndex + 1) % lbImages.length; lbImg.src = lbImages[lbIndex]; }
    });

    // --- Mini-carousel state ---
    let currentCarouselImages = [];
    let currentCarouselIndex  = 0;

    function buildImagePreview(srcs) {
        currentCarouselImages = srcs;
        currentCarouselIndex  = 0;

        previewMediaWrap.innerHTML = "";

        if (srcs.length === 0) return;

        if (srcs.length === 1) {
            // Single image + expand button
            const img = document.createElement("img");
            img.src = srcs[0];
            img.className = "preview-media-img";
            previewMediaWrap.appendChild(img);
            appendExpandBtn(srcs, 0);
            return;
        }

        // Multiple images → mini carousel
        const track = document.createElement("div");
        track.className = "preview-carousel-track";

        srcs.forEach(function(src) {
            const img = document.createElement("img");
            img.src = src;
            img.className = "preview-media-img";
            track.appendChild(img);
        });

        previewMediaWrap.appendChild(track);

        // Arrows
        const btnPrev = document.createElement("button");
        btnPrev.className = "preview-carousel-btn prev";
        btnPrev.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;
        btnPrev.title = "Anterior";

        const btnNext = document.createElement("button");
        btnNext.className = "preview-carousel-btn next";
        btnNext.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
        btnNext.title = "Siguiente";

        previewMediaWrap.appendChild(btnPrev);
        previewMediaWrap.appendChild(btnNext);

        // Dots indicator
        const dots = document.createElement("div");
        dots.className = "preview-carousel-dots";
        srcs.forEach(function(_, i) {
            const dot = document.createElement("span");
            dot.className = "preview-carousel-dot" + (i === 0 ? " active" : "");
            dot.addEventListener("click", function() { goTo(i); });
            dots.appendChild(dot);
        });
        previewMediaWrap.appendChild(dots);

        function goTo(index) {
            currentCarouselIndex = index;
            track.style.transform = "translateX(-" + (index * 100) + "%)";
            dots.querySelectorAll(".preview-carousel-dot").forEach(function(d, i) {
                d.classList.toggle("active", i === index);
            });
        }

        btnPrev.addEventListener("click", function() {
            goTo((currentCarouselIndex - 1 + srcs.length) % srcs.length);
        });

        btnNext.addEventListener("click", function() {
            goTo((currentCarouselIndex + 1) % srcs.length);
        });

        appendExpandBtn(srcs, null);

        function appendExpandBtn(images, fixedIndex) {
            const btn = document.createElement("button");
            btn.className = "preview-expand-btn";
            btn.title = "Ver imagen ampliada";
            btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><polyline points="0,4 0,0 4,0"/><polyline points="10,0 14,0 14,4"/><polyline points="14,10 14,14 10,14"/><polyline points="4,14 0,14 0,10"/></svg>';
            btn.addEventListener("click", function() {
                openLightbox(images, fixedIndex !== null ? fixedIndex : currentCarouselIndex);
            });
            previewMediaWrap.appendChild(btn);
        }
    }

    function appendExpandBtn(images, fixedIndex) {
        const btn = document.createElement("button");
        btn.className = "preview-expand-btn";
        btn.title = "Ver imagen ampliada";
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><polyline points="0,4 0,0 4,0"/><polyline points="10,0 14,0 14,4"/><polyline points="14,10 14,14 10,14"/><polyline points="4,14 0,14 0,10"/></svg>';
        btn.addEventListener("click", function() {
            openLightbox(images, fixedIndex !== null ? fixedIndex : currentCarouselIndex);
        });
        previewMediaWrap.appendChild(btn);
    }

    // --- Language helpers ---
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

    // --- Show preview ---
    function showPreview(item) {
        const title       = item.getAttribute("data-title");
        const categoryKey = item.getAttribute("data-category-key");
        const tags        = (item.getAttribute("data-tags") || "").split(",").filter(Boolean);
        const previewType = item.getAttribute("data-preview-type");
        const previewSrc  = item.getAttribute("data-preview-src");
        const previewSrcs = item.getAttribute("data-preview-srcs");
        const descKey     = item.getAttribute("data-desc-key");
        const url         = item.getAttribute("data-url");

        selectedUrl = url;

        previewTitle.textContent = title;

        previewCategory.dataset.categoryKey = categoryKey;
        updatePreviewCategory();

        previewTags.innerHTML = tags.map(function(t) {
            return '<span class="preview-tag">' + t + '</span>';
        }).join("");

        previewDescription.dataset.descKey = descKey;
        updatePreviewDescription();

        previewMediaWrap.innerHTML = "";

        if (previewType === "video" && previewSrc) {
            const video = document.createElement("video");
            video.src = previewSrc;
            video.controls = false;
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video.className = "preview-media-img";
            previewMediaWrap.appendChild(video);

            const fsBtn = document.createElement("button");
            fsBtn.className = "preview-expand-btn";
            fsBtn.title = "Pantalla completa";
            fsBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><polyline points="0,4 0,0 4,0"/><polyline points="10,0 14,0 14,4"/><polyline points="14,10 14,14 10,14"/><polyline points="4,14 0,14 0,10"/></svg>';
            fsBtn.addEventListener("click", function() {
                if (video.requestFullscreen) video.requestFullscreen();
                else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
            });
            previewMediaWrap.appendChild(fsBtn);
        } else if (previewType === "image") {
            const srcs = previewSrcs
                ? previewSrcs.split("|").map(function(s) { return s.trim(); }).filter(Boolean)
                : (previewSrc ? [previewSrc] : []);
            buildImagePreview(srcs);
        }

        previewEmpty.style.display  = "none";
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

    document.querySelectorAll(".carpeta-item").forEach(function(item) {
        item.addEventListener("click", function () {
            document.querySelectorAll(".carpeta-item").forEach(function(e) { e.classList.remove("selected"); });
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

    // Sidebar links
    const linkDesarrollo = document.getElementById("link-desarrollo");
    const linkLaborales  = document.getElementById("link-laborales");
    const linkPrototipos = document.getElementById("link-prototipos");
    const linkAll        = document.getElementById("link-all");
    const xpContent      = document.getElementById("xp-content");

    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el && xpContent) {
            xpContent.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
        }
    }

    if (linkDesarrollo) linkDesarrollo.addEventListener("click", function(e) { e.preventDefault(); scrollToSection("section-desarrollo"); });
    if (linkLaborales)  linkLaborales.addEventListener("click",  function(e) { e.preventDefault(); scrollToSection("section-laborales"); });
    if (linkPrototipos) linkPrototipos.addEventListener("click", function(e) { e.preventDefault(); scrollToSection("section-prototipos"); });
    if (linkAll)        linkAll.addEventListener("click",        function(e) { e.preventDefault(); if (xpContent) xpContent.scrollTo({ top: 0, behavior: "smooth" }); });

    const linkDesktop = document.getElementById("link-desktop");
    const linkMyDocs  = document.getElementById("link-mydocs");
    if (linkDesktop) linkDesktop.addEventListener("click", function(e) { e.preventDefault(); window.parent.postMessage({ command: "minimize" }, "*"); });
    if (linkMyDocs)  linkMyDocs.addEventListener("click",  function(e) { e.preventDefault(); });

    window.addEventListener("languageChanged", function () {
        updatePreviewDescription();
        updatePreviewCategory();
    });

    // Resizable preview panel
    const resizeHandle = document.getElementById("xp-resize-handle");
    const previewPanel = document.getElementById("xp-preview");

    if (resizeHandle && previewPanel) {
        let startX = 0;
        let startWidth = 0;

        resizeHandle.addEventListener("mousedown", function (e) {
            startX = e.clientX;
            startWidth = previewPanel.offsetWidth;
            resizeHandle.classList.add("dragging");

            function onMouseMove(e) {
                const delta = startX - e.clientX;
                const newWidth = Math.min(520, Math.max(160, startWidth + delta));
                previewPanel.style.width = newWidth + "px";
            }

            function onMouseUp() {
                resizeHandle.classList.remove("dragging");
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            e.preventDefault();
        });
    }
});

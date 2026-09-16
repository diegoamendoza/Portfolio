/*
 * Motor de traducción del sitio.
 *
 * Los textos viven en i18n/es.json e i18n/en.json (fuente única).
 * El HTML conserva el texto en español escrito directamente en la marca
 * (respaldo para SEO, para no-JS y para cuando el JSON aún no ha cargado).
 *
 * Uso en el HTML:
 *   <p data-translate="clave">Texto en español</p>
 *   <img data-translate-alt="clave" alt="Texto en español">
 *   <button data-translate-title="clave" title="Texto en español">
 *
 * Este script se carga tanto en index.html como dentro de cada iframe de
 * las ventanas, por eso resuelve la ruta de i18n/ de forma relativa al
 * propio archivo (js/language.js -> ../i18n/).
 */
(function () {
    "use strict";

    var SUPPORTED = ["es", "en"];
    var DEFAULT_LANG = "es";
    var STORAGE_KEY = "language";

    // Ruta absoluta a la carpeta i18n, deducida de la ubicación de este script.
    var I18N_BASE = (function () {
        var src = (document.currentScript && document.currentScript.src) || "";
        if (!src) return "i18n/";
        return src.replace(/js\/language\.js.*$/, "i18n/");
    })();

    var translations = { es: {}, en: {} };
    var loaded = {};

    function detectUserLanguage() {
        var list = (navigator.languages && navigator.languages.length)
            ? navigator.languages
            : [navigator.language || navigator.userLanguage || ""];
        var primary = (list[0] || "").toLowerCase();
        return primary.indexOf("es") === 0 ? "es" : "en";
    }

    function readStoredLanguage() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
        } catch (e) { /* localStorage bloqueado */ }
        return null;
    }

    var currentLanguage = readStoredLanguage() || detectUserLanguage();

    function getTranslation(key) {
        var dict = translations[currentLanguage];
        if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
        var fallback = translations[DEFAULT_LANG];
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
        return null;
    }

    function applyTranslations(root) {
        var scope = root || document;

        scope.querySelectorAll("[data-translate]").forEach(function (el) {
            var value = getTranslation(el.getAttribute("data-translate"));
            if (value === null) return;
            if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
                el.value = value;
            } else {
                el.innerHTML = value;
            }
        });

        scope.querySelectorAll("[data-translate-alt]").forEach(function (el) {
            var value = getTranslation(el.getAttribute("data-translate-alt"));
            if (value !== null) el.setAttribute("alt", value);
        });

        scope.querySelectorAll("[data-translate-title]").forEach(function (el) {
            var value = getTranslation(el.getAttribute("data-translate-title"));
            if (value !== null) {
                el.setAttribute("title", value);
                if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", value);
            }
        });

        scope.querySelectorAll("[data-translate-aria-label]").forEach(function (el) {
            var value = getTranslation(el.getAttribute("data-translate-aria-label"));
            if (value !== null) el.setAttribute("aria-label", value);
        });
    }

    function updateDocumentLanguage() {
        document.documentElement.setAttribute("lang", currentLanguage);
        var title = getTranslation("site-title");
        if (title && document.documentElement.hasAttribute("data-translate-title-tag")) {
            document.title = title;
        }
    }

    function fetchLanguage(lang) {
        if (loaded[lang]) return Promise.resolve(translations[lang]);
        return fetch(I18N_BASE + lang + ".json", { cache: "no-cache" })
            .then(function (response) {
                if (!response.ok) throw new Error("HTTP " + response.status);
                return response.json();
            })
            .then(function (data) {
                translations[lang] = data;
                loaded[lang] = true;
                return data;
            })
            .catch(function (error) {
                // Sin JSON el sitio sigue funcionando: queda el texto en español
                // escrito en el HTML. Pasa, por ejemplo, al abrir el sitio con
                // file:// en vez de servirlo por HTTP.
                console.warn("[i18n] No se pudo cargar " + lang + ".json:", error.message);
                loaded[lang] = true;
                return translations[lang];
            });
    }

    function setLanguage(lang, options) {
        if (!lang || SUPPORTED.indexOf(lang) === -1) return Promise.resolve();
        var silent = options && options.silent;
        currentLanguage = lang;
        window.currentLanguage = lang;

        if (!silent) {
            try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignorado */ }
        }

        return fetchLanguage(lang).then(function () {
            applyTranslations(document);
            updateDocumentLanguage();
            window.dispatchEvent(new CustomEvent("languageChanged", {
                detail: { language: currentLanguage }
            }));
        });
    }

    function toggleLanguage() {
        return setLanguage(currentLanguage === "es" ? "en" : "es");
    }

    // API pública (compatible con el código anterior).
    window.translations = translations;
    window.currentLanguage = currentLanguage;
    window.setLanguage = setLanguage;
    window.toggleLanguage = toggleLanguage;
    window.applyTranslations = applyTranslations;
    window.getTranslation = getTranslation;
    window.getCurrentLanguage = function () { return currentLanguage; };
    window.SUPPORTED_LANGUAGES = SUPPORTED;

    // Carga inicial: el español siempre, para poder usarlo como respaldo.
    var initial = fetchLanguage(DEFAULT_LANG).then(function () {
        return setLanguage(currentLanguage, { silent: true });
    });
    window.i18nReady = initial;

    // Sincroniza el idioma entre pestañas y entre los iframes de las ventanas.
    window.addEventListener("storage", function (event) {
        if (event.key === STORAGE_KEY && event.newValue && event.newValue !== currentLanguage) {
            setLanguage(event.newValue, { silent: true });
        }
    });

    // El escritorio avisa a las ventanas (iframes) cuando cambia el idioma.
    window.addEventListener("message", function (event) {
        var data = event.data;
        if (data && data.command === "set_language" && data.language) {
            setLanguage(data.language, { silent: true });
        }
    });
})();

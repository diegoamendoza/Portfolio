/*
 * Escritorio: iconos, ventanas, barra de tareas, selector de idioma
 * y conmutador entre "escritorio" y "versión simple".
 */
(function () {
    "use strict";

    var MOBILE_QUERY = "(max-width: 767px)";

    function isMobile() {
        return window.matchMedia(MOBILE_QUERY).matches;
    }

    var isTouchDevice = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

    /* ------------------------------------------------------------------ *
     * Ventanas disponibles desde el escritorio
     * ------------------------------------------------------------------ */
    var WINDOWS = {
        proyectos: { url: "pages/misproyectos.html", titleKey: "mis-proyectos", title: "Mis proyectos", width: 1024, height: 612, x: 276, y: 15, icon: "projects" },
        sobremi:   { url: "pages/aboutme.html",      titleKey: "sobre-mi",      title: "Sobre mí",      width: 880,  height: 580, icon: "about" },
        cv:        { url: "pages/cv.html",           titleKey: "cv",            title: "CV",            width: 800,  height: 600, icon: "cv" },
        contacto:  { url: "pages/contacto.html",     titleKey: "contacto",      title: "Contacto",      width: 820,  height: 560, icon: "contact" },
        readme:    { url: "pages/readme.html",       titleKey: "readme-window-title", title: "ReadMe.txt - Bloc de notas", width: 560,  height: 520, x: 244, y: 16, icon: "readme" },
        paint:     { url: "09-paint-win-95/paint.html", titleKey: "paint",      title: "Paint",         width: 700,  height: 560, x: 420, y: 60, icon: "paint" },
        meowjump:  { url: "meow-jump/index.html",    titleKey: "meow-jump",     title: "Meow Jump!",    width: 313,  height: 692, x: 255, y: 9, icon: "meowjump", resizable: false },
        colorsort: { url: "ColorSortWeb/index.html", titleKey: "color-sort",    title: "Color Sort",    width: 313,  height: 692, x: 300, y: 9, icon: "colorsort", resizable: false }
    };

    var wm;

    function translate(key, fallback) {
        var value = (typeof window.getTranslation === "function") ? window.getTranslation(key) : null;
        return value === null || value === undefined ? fallback : value;
    }

    // Abre una ventana con el tamaño pedido, pero siempre dentro de la pantalla.
    function openWindow(def) {
        if (!wm) return null;

        var taskbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--taskbar-height"), 10) || 0;
        var viewportWidth = window.innerWidth;
        var viewportHeight = Math.max(window.innerHeight - taskbarHeight, 320);

        var maxWidth = viewportWidth * 0.95;
        var maxHeight = viewportHeight * 0.9;
        var width = Math.min(def.width || maxWidth, maxWidth);
        var height = Math.min(def.height || maxHeight, maxHeight);
        var x = Math.max(8, Math.min(def.x === undefined ? (viewportWidth - width) / 2 : def.x, viewportWidth - width - 8));
        var y = Math.max(8, Math.min(def.y === undefined ? (viewportHeight - height) / 2 : def.y, viewportHeight - height - 8));

        var iconPath = (window.ICONS && window.ICONS[def.icon]) ? window.ICONS[def.icon].png : undefined;

        return wm.add_window(def.url, {
            title: translate(def.titleKey, def.title),
            titleKey: def.titleKey,
            width: width,
            height: height,
            x: x,
            y: y,
            icon: iconPath,
            resizable: def.resizable
        });
    }

    function openWindowByKey(key) {
        return WINDOWS[key] ? openWindow(WINDOWS[key]) : null;
    }

    // Abre una ventana desde una URL cualquiera (lo usa la versión simple).
    function openWindowByUrl(url, title) {
        return openWindow({ url: url, title: title || url, width: 900, height: 600 });
    }

    /* ------------------------------------------------------------------ *
     * Versión simple  <->  escritorio
     * ------------------------------------------------------------------ */
    function setSimpleMode(enabled, updateHistory) {
        document.documentElement.classList.toggle("simple-mode", !!enabled);

        if (updateHistory !== false && window.history && window.history.replaceState) {
            var url = new URL(window.location.href);
            if (enabled) url.searchParams.set("view", "simple");
            else url.searchParams.delete("view");
            window.history.replaceState({ view: enabled ? "simple" : "desktop" }, "", url.toString());
        }

        if (enabled) {
            var content = document.getElementById("content");
            if (content) {
                content.setAttribute("tabindex", "-1");
                content.focus({ preventScroll: true });
                window.scrollTo(0, 0);
            }
        } else {
            var trigger = document.querySelector("#desktop-icons .icon");
            if (trigger) trigger.focus({ preventScroll: true });
        }
    }

    function isSimpleMode() {
        return document.documentElement.classList.contains("simple-mode");
    }

    /* ------------------------------------------------------------------ *
     * Reloj de la barra de tareas
     * ------------------------------------------------------------------ */
    function startClock() {
        var time = document.getElementById("taskbar-time");
        if (!time) return;

        function locale() {
            return (typeof window.getCurrentLanguage === "function" && window.getCurrentLanguage() === "en") ? "en-US" : "es-CL";
        }

        function render() {
            var now = new Date();
            time.textContent = new Intl.DateTimeFormat(locale(), { hour: "numeric", minute: "numeric" }).format(now);
            time.setAttribute("title", new Intl.DateTimeFormat(locale(), {
                hour: "numeric", minute: "numeric", year: "numeric", month: "long", day: "numeric"
            }).format(now));
        }

        render();
        setInterval(render, 30000);
        window.addEventListener("languageChanged", render);
    }

    /* ------------------------------------------------------------------ *
     * Selector de idioma (bandeja de la barra de tareas)
     * ------------------------------------------------------------------ */
    function setupLanguageSwitcher() {
        var root = document.getElementById("language-switcher");
        var button = document.getElementById("language-switcher-button");
        var menu = document.getElementById("language-switcher-menu");
        var current = document.getElementById("language-switcher-current");
        if (!root || !button || !menu || !current) return;

        function closeMenu() {
            menu.hidden = true;
            button.setAttribute("aria-expanded", "false");
        }

        function openMenu() {
            menu.hidden = false;
            button.setAttribute("aria-expanded", "true");
            var selected = menu.querySelector('[aria-selected="true"]') || menu.firstElementChild;
            if (selected) selected.focus();
        }

        button.addEventListener("click", function () {
            if (menu.hidden) openMenu(); else closeMenu();
        });

        menu.addEventListener("click", function (event) {
            var option = event.target.closest("[data-lang]");
            if (!option) return;
            window.setLanguage(option.getAttribute("data-lang"));
            closeMenu();
            button.focus();
        });

        menu.addEventListener("keydown", function (event) {
            var options = Array.prototype.slice.call(menu.querySelectorAll("[data-lang]"));
            var index = options.indexOf(document.activeElement);

            if (event.key === "Escape") {
                event.stopPropagation(); // que no cierre también la ventana activa
                closeMenu();
                button.focus();
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                var next = event.key === "ArrowDown" ? index + 1 : index - 1;
                if (next < 0) next = options.length - 1;
                if (next >= options.length) next = 0;
                options[next].focus();
            } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (document.activeElement && document.activeElement.hasAttribute("data-lang")) {
                    window.setLanguage(document.activeElement.getAttribute("data-lang"));
                    closeMenu();
                    button.focus();
                }
            }
        });

        document.addEventListener("click", function (event) {
            if (!menu.hidden && !root.contains(event.target)) closeMenu();
        });

        function syncSwitcher() {
            var lang = window.getCurrentLanguage ? window.getCurrentLanguage() : "es";
            current.textContent = lang === "es" ? "ESP" : "EN";
            menu.querySelectorAll("[data-lang]").forEach(function (option) {
                option.setAttribute("aria-selected", option.getAttribute("data-lang") === lang ? "true" : "false");
            });
            // Propaga el idioma a las ventanas abiertas (iframes) y a sus pestañas.
            if (wm) {
                wm.update_taskbar();
                wm.window_list.forEach(function (win) {
                    try {
                        win.iframe.contentWindow.postMessage({ command: "set_language", language: lang }, "*");
                    } catch (e) { /* iframe aún no listo */ }
                });
            }
        }

        window.addEventListener("languageChanged", syncSwitcher);
        syncSwitcher();
    }

    /* ------------------------------------------------------------------ *
     * Iconos del escritorio
     * ------------------------------------------------------------------ */
    function setupIcons() {
        var icons = document.querySelectorAll(".icon[data-window]");

        function selectIcon(icon) {
            document.querySelectorAll(".icon").forEach(function (el) {
                el.classList.remove("selected");
                el.setAttribute("aria-pressed", "false");
            });
            icon.classList.add("selected");
            icon.setAttribute("aria-pressed", "true");
        }

        function activate(icon) {
            openWindowByKey(icon.getAttribute("data-window"));
        }

        icons.forEach(function (icon) {
            icon.setAttribute("aria-pressed", "false");

            icon.addEventListener("click", function (event) {
                selectIcon(icon);
                // En pantallas táctiles un solo toque abre; con ratón hace falta doble clic.
                if (isTouchDevice && event.detail !== 0) activate(icon);
            });

            if (!isTouchDevice) {
                icon.addEventListener("dblclick", function () { activate(icon); });
            }

            icon.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                    event.preventDefault();
                    selectIcon(icon);
                    activate(icon);
                }
            });
        });

        var desktop = document.getElementById("desktop");
        if (desktop) {
            desktop.addEventListener("click", function (event) {
                if (!event.target.closest(".icon") && !event.target.closest(".win")) {
                    document.querySelectorAll(".icon").forEach(function (el) {
                        el.classList.remove("selected");
                        el.setAttribute("aria-pressed", "false");
                    });
                }
            });
        }
    }

    /* ------------------------------------------------------------------ *
     * Enlaces de la versión simple que abren ventanas del escritorio
     * ------------------------------------------------------------------ */
    function setupSimpleViewLinks() {
        document.querySelectorAll("[data-open-window]").forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                setSimpleMode(false);
                openWindowByUrl(link.getAttribute("data-open-window"), link.getAttribute("data-window-title"));
            });
        });

        ["btn-desktop-view", "btn-desktop-view-footer"].forEach(function (id) {
            var button = document.getElementById(id);
            if (button) button.addEventListener("click", function () { setSimpleMode(false); });
        });
    }

    /* ------------------------------------------------------------------ *
     * Teclado global
     * ------------------------------------------------------------------ */
    function setupKeyboard() {
        document.addEventListener("keydown", function (event) {
            if (event.key !== "Escape") return;

            if (isSimpleMode()) {
                setSimpleMode(false);
                return;
            }
            var focused = document.querySelector(".win.focused");
            if (focused && wm) wm.remove_window(focused);
        });
    }

    /* ------------------------------------------------------------------ *
     * Arranque
     * ------------------------------------------------------------------ */
    document.addEventListener("DOMContentLoaded", function () {
        if (typeof window.applyIcons === "function") window.applyIcons(document);

        var container = document.getElementById("window_container");
        var template = document.getElementById("window_template");

        wm = new WindowManager(container, template, false);
        // En móvil toda ventana nueva (también las que piden los iframes) va a pantalla completa.
        wm.callbacks.win_add = function (win) {
            if (isMobile()) wm.maximize_window(win, true);
        };
        wm.register_mouse_events(window);
        wm.register_message_events();
        window.wm = wm;
        window.openWindowByKey = openWindowByKey;

        setupIcons();
        setupSimpleViewLinks();
        setupLanguageSwitcher();
        setupKeyboard();
        startClock();

        var startButton = document.getElementById("start-button");
        if (startButton) {
            startButton.addEventListener("click", function () {
                if (isSimpleMode()) setSimpleMode(false);
                openWindowByKey("readme");
            });
        }

        // El ReadMe hace de carta de presentación: se abre solo al entrar
        // (salvo que se haya entrado directo a la versión simple).
        if (!isSimpleMode()) openWindowByKey("readme");

        // Al cambiar entre móvil y escritorio, las ventanas abiertas se adaptan.
        var mediaQuery = window.matchMedia(MOBILE_QUERY);
        var onChange = function (event) {
            if (!wm) return;
            wm.window_list.forEach(function (win) {
                if (event.matches) wm.maximize_window(win, true);
                else if (win.classList.contains("mobile-maximized")) wm.restore_window(win);
            });
        };
        if (mediaQuery.addEventListener) mediaQuery.addEventListener("change", onChange);
        else if (mediaQuery.addListener) mediaQuery.addListener(onChange);
    });
})();

/*
 * REGISTRO CENTRAL DE ICONOS
 * --------------------------
 * Este archivo es el ÚNICO lugar donde se definen las rutas de los iconos
 * del escritorio, de las barras de título y de la barra de tareas.
 * Para cambiar un icono basta con editar su entrada aquí.
 *
 * Los iconos marcados con  origin: "microsoft"  son los iconos originales de
 * Windows XP y son propiedad de Microsoft: son los candidatos a reemplazar por
 * arte propio. Ver docs/ICONOS.md para el detalle.
 *
 * Cada entrada:
 *   png     ruta del PNG original (respaldo de <picture> y de navegadores viejos)
 *   webp    versión optimizada que se sirve primero
 *   width   ancho intrínseco declarado en el HTML (evita saltos de diseño)
 *   height  alto intrínseco
 *   origin  "microsoft" | "propio" | "terceros"
 *
 * Al arrancar, applyIcons() reescribe el src de todo elemento con
 * data-icon="clave" para que el HTML estático siga a este registro aunque
 * no se haya actualizado a mano.
 */
(function () {
    "use strict";

    var ICONS = {
        projects:   { png: "img/documents.png",              webp: "img/documents.webp",              width: 192, height: 192, origin: "microsoft", note: "Mis documentos (Windows XP)" },
        about:      { png: "img/information.png",            webp: "img/information.webp",            width: 192, height: 192, origin: "microsoft", note: "Información (Windows XP)" },
        cv:         { png: "img/generic-text-document.png",  webp: "img/generic-text-document.webp",  width: 192, height: 192, origin: "microsoft", note: "Documento de texto genérico (Windows XP)" },
        contact:    { png: "img/windows-messenger.png",      webp: "img/windows-messenger.webp",      width: 192, height: 192, origin: "microsoft", note: "Windows Messenger (Microsoft)" },
        readme:     { png: "img/notepad.png",                webp: "img/notepad.webp",                width: 192, height: 192, origin: "microsoft", note: "Bloc de notas (Windows XP)" },
        paint:      { png: "img/paint.png",                  webp: "img/paint.webp",                  width: 192, height: 192, origin: "microsoft", note: "Paint (Microsoft)" },
        meowjump:   { png: "img/logo-meow-jump.png",         webp: "img/logo-meow-jump.webp",         width: 192, height: 192, origin: "propio",    note: "Logo de Meow Jump!" },
        colorsort:  { png: "img/color-sort.png",             webp: "img/color-sort.webp",             width: 192, height: 192, origin: "propio",    note: "Logo de Color Sort" },
        simple:     { png: "img/icons/simple-view.svg",      webp: "img/icons/simple-view.svg",       width: 64,  height: 64,  origin: "propio",    note: "Versión simple (SVG propio)" },
        start:      { png: "img/logo.svg",                   webp: "img/logo.svg",                    width: 20,  height: 20,  origin: "propio",    note: "Logo del botón Inicio" }
    };

    function iconSrc(key) {
        var icon = ICONS[key];
        if (!icon) return null;
        // El PNG es la ruta canónica: el WebP se sirve vía <picture> en el HTML.
        return icon.png;
    }

    // Ajusta una ruta de icono a la profundidad del documento actual
    // (las ventanas viven en pages/ y pages/projects/).
    function resolve(path, basePrefix) {
        if (!path) return path;
        return (basePrefix || "") + path;
    }

    function applyIcons(root) {
        var scope = root || document;
        scope.querySelectorAll("[data-icon]").forEach(function (el) {
            var icon = ICONS[el.getAttribute("data-icon")];
            if (!icon) return;

            if (el.tagName === "IMG") {
                if (el.getAttribute("src") !== icon.png) el.setAttribute("src", icon.png);
                if (!el.hasAttribute("width")) el.setAttribute("width", icon.width);
                if (!el.hasAttribute("height")) el.setAttribute("height", icon.height);
                var picture = el.parentElement;
                if (picture && picture.tagName === "PICTURE") {
                    var source = picture.querySelector("source");
                    if (source && source.getAttribute("srcset") !== icon.webp) {
                        source.setAttribute("srcset", icon.webp);
                    }
                }
            }
        });
    }

    window.ICONS = ICONS;
    window.iconSrc = iconSrc;
    window.resolveIcon = resolve;
    window.applyIcons = applyIcons;
})();

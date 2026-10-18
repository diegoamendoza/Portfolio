/*
 * Se carga dentro de cada página que vive en una ventana (iframe).
 * Da el comportamiento de teclado que el escritorio no puede aplicar desde fuera:
 * Escape cierra la ventana.
 */
(function () {
    "use strict";

    function inFrame() {
        try { return window.self !== window.top; } catch (e) { return true; }
    }

    if (!inFrame()) return;

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        // Si hay un lightbox abierto lo cierra su propio manejador, no esta ventana.
        if (document.querySelector("#preview-lightbox.active")) return;
        window.parent.postMessage({ command: "close" }, "*");
    });
})();

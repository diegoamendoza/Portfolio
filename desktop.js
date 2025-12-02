document.addEventListener("DOMContentLoaded", function () {
    const time = document.querySelector(".time");
    if (time) {
        time.innerHTML = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date());
        time.setAttribute("title", new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true, year: 'numeric', month: 'long', day: 'numeric' }).format(new Date()));
  
        setInterval(() => {
            time.innerHTML = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date());
            time.setAttribute("title", new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true, year: 'numeric', month: 'long', day: 'numeric' }).format(new Date()));
        }, 60000);
    }

    const languageSwitcher = document.getElementById("language-switcher");
    if (languageSwitcher) {
        languageSwitcher.addEventListener("click", () => {
            toggleLanguage();
        });
    }

    const translationBubble = document.querySelector(".translation-bubble");
    const translationBubbleClose = translationBubble ? translationBubble.querySelector(".translation-bubble__close") : null;
    const translationBubbleTitle = translationBubble ? translationBubble.querySelector(".translation-bubble__title") : null;
    const translationBubbleMessage = translationBubble ? translationBubble.querySelector(".translation-bubble__message") : null;

    const translationTexts = {
        es: {
            title: "Traducción",
            message: "Presionando este botón puedes traducir la página."
        },
        en: {
            title: "Translation",
            message: "Press this button to translate the page."
        }
    };

    function updateTranslationBubble(languageCode) {
        if (!translationBubble || !translationBubbleTitle || !translationBubbleMessage) return;

        const alternateLanguage = languageCode === "es" ? "en" : "es";
        const copy = translationTexts[alternateLanguage];

        translationBubbleTitle.textContent = copy.title;
        translationBubbleMessage.textContent = copy.message;
    }

    function positionTranslationBubble() {
        if (!translationBubble) return;

        const switcher = document.getElementById("language-switcher");
        if (!switcher) return;

        translationBubble.style.right = "auto";
        translationBubble.style.bottom = "auto";

        const bubbleRect = translationBubble.getBoundingClientRect();
        const switcherRect = switcher.getBoundingClientRect();

        const top = Math.max(12, switcherRect.top - bubbleRect.height - 12);
        const left = Math.min(
            Math.max(12, switcherRect.left + (switcherRect.width / 2) - (bubbleRect.width / 2)),
            window.innerWidth - bubbleRect.width - 12
        );

        const arrowOffset = (switcherRect.left + switcherRect.width / 2) - left - 12;

        translationBubble.style.top = `${top}px`;
        translationBubble.style.left = `${left}px`;
        translationBubble.style.setProperty("--bubble-arrow-offset", `${Math.max(12, Math.min(bubbleRect.width - 24, arrowOffset))}px`);
    }

    if (translationBubble && translationBubbleClose) {
        translationBubbleClose.addEventListener("click", () => {
            translationBubble.classList.add("hidden");
        });
    }

    if (translationBubble) {
        const initialLanguage = typeof currentLanguage !== "undefined" ? currentLanguage : "en";
        updateTranslationBubble(initialLanguage);
        positionTranslationBubble();

        window.addEventListener("resize", positionTranslationBubble);
        window.addEventListener("languageChanged", (event) => {
            const languageCode = event.detail?.language || initialLanguage;
            updateTranslationBubble(languageCode);
            positionTranslationBubble();
        });
    }

    document.querySelector("#cssportal-grid").onclick = function () {
        document.querySelectorAll(".icon").forEach((e) => {
            e.classList.remove("selected");
        });
    };
  
    document.querySelectorAll(".icon").forEach((icon) => {
        icon.onclick = function () {
            setTimeout(() => {
                document.querySelectorAll(".icon").forEach((e) => {
                    e.classList.remove("selected");
                });
                this.classList.add("selected");
            }, 1);
        };
    });
  
    let startX = 0, startY = 0, initialX = 0, initialY = 0;
    let initialWidth = 0, initialHeight = 0;
    let activeCard = null;
    let resizing = false;
  
    const windows = document.querySelectorAll('.window');
  
    windows.forEach(window => {
        const titleBar = window.querySelector('.title-bar');
        const resizer = window.querySelector('.resizer');
  
        titleBar.addEventListener('mousedown', (e) => {
            mouseDown(e, false);
        });
        
        resizer.addEventListener('mousedown', (e) => {
            mouseDown(e, true);
        });
  
        window.addEventListener('mousedown', () => {
            bringToFront(window);
        });
  
        window.querySelector('.max').addEventListener('click', () => {
            const isMaximized = window.classList.toggle("maximized");
  
            if (isMaximized) {
                minimizeOtherWindows(window);
                window.dataset.lastTop = window.style.top;
                window.dataset.lastLeft = window.style.left;
                window.dataset.lastWidth = window.style.width;
                window.dataset.lastHeight = window.style.height;
  
                window.style.top = "0";
                window.style.left = "0";
                window.style.width = "100%";
                window.style.height = "calc(100% - 32px)";
                window.style.zIndex = "1000";
            } else {
                window.style.top = window.dataset.lastTop;
                window.style.left = window.dataset.lastLeft;
                window.style.width = window.dataset.lastWidth;
                window.style.height = window.dataset.lastHeight;
                resetZIndex(window);
            }
        });
  
        window.querySelector('.min').addEventListener('click', () => {
            window.classList.toggle("minimized");
        });
  
        window.querySelector('.cls').addEventListener('click', () => {
            window.style.display = "none";
        });
    });
  
    function mouseDown(e, isResizer) {
        resizing = isResizer;
        activeCard = e.target.closest('.window');
        if (!activeCard) return;
  
        startX = e.clientX;
        startY = e.clientY;
        initialX = activeCard.offsetLeft;
        initialY = activeCard.offsetTop;
        initialWidth = activeCard.offsetWidth;
        initialHeight = activeCard.offsetHeight;
  
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        e.preventDefault();
    }
  
    function mouseMove(e) {
        if (!activeCard) return;
  
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
  
        if (resizing) {
            const newWidth = Math.max(initialWidth + dx, 200);
            const newHeight = Math.max(initialHeight + dy, 200);
            activeCard.style.width = newWidth + 'px';
            activeCard.style.height = newHeight + 'px';
        } else {
            activeCard.style.left = (initialX + dx) + 'px';
            activeCard.style.top = (initialY + dy) + 'px';
        }
    }
  
    function mouseUp() {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
        activeCard = null;
        resizing = false;
    }
  
    function minimizeOtherWindows(exceptWindow) {
        windows.forEach(window => {
            if (window !== exceptWindow) {
                window.style.zIndex = "999";
            }
        });
    }
  
    function resetZIndex(exceptWindow) {
        windows.forEach(window => {
            if (window !== exceptWindow) {
                window.style.zIndex = "";
            }
        });
    }
  
    function bringToFront(window) {
        windows.forEach(w => {
            w.style.zIndex = "999";
        });
        window.style.zIndex = "1000";
    }
  
  
    // Parte nueva para manejar el mensaje
    const iframe = document.getElementById("proyectosiframe");
  

  
    window.addEventListener("message", function (event) {
      const message = event.data;
      if (message && message.type === "folderClick") {
          iframe.src = message.data.url;
      }
  });
  });
  
  function reasignarListeners() {
    const iframeDocument = document.getElementById("proyectosiframe").contentDocument || document.getElementById("proyectosiframe").contentWindow.document;
    const carpetaItems = iframeDocument.querySelectorAll(".carpeta-item");
    carpetaItems.forEach((carpeta, index) => {
        carpeta.classList.remove("fade-in-bottom");
        setTimeout(() => {
            carpeta.classList.add("fade-in-bottom");
        }, index * 100);

        carpeta.onclick = function () {
            iframeDocument.querySelectorAll(".carpeta-item").forEach((e) => {
                e.classList.remove("selected");
            });
            carpeta.classList.add("selected");
            console.log("baka");
            const url = carpeta.getAttribute("data-url");

            // Send message to parent window (if applicable)
            const message = {
                type: "folderClick",
                data: {
                    url: url
                }
            };

            window.parent.postMessage(message, "*");
            console.log("message sended");
        };
    });
}
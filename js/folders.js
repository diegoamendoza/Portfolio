document.addEventListener("DOMContentLoaded", function () {
    const projectIframe = document.getElementById("project-iframe");

    document.querySelectorAll(".carpeta-item").forEach((carpeta) => {
        carpeta.onclick = function () {
            document.querySelectorAll(".carpeta-item").forEach((e) => {
                e.classList.remove("selected");
            });
            this.classList.add("selected");

            const url = this.getAttribute("data-url");
            if (projectIframe) {
                projectIframe.src = url;
            }
        };
    });
});

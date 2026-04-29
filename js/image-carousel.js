document.addEventListener('DOMContentLoaded', () => {
    // Create shared lightbox once
    const lightbox = document.createElement('div');
    lightbox.className = 'carousel-lightbox';
    lightbox.innerHTML = `
        <div class="carousel-lightbox-inner">
            <button class="carousel-lightbox-close" title="Cerrar">&times;</button>
            <button class="carousel-lightbox-prev" title="Anterior"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button>
            <img src="" alt="">
            <button class="carousel-lightbox-next" title="Siguiente"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </div>`;
    document.body.appendChild(lightbox);

    const lbImg   = lightbox.querySelector('img');
    const lbClose = lightbox.querySelector('.carousel-lightbox-close');
    const lbPrev  = lightbox.querySelector('.carousel-lightbox-prev');
    const lbNext  = lightbox.querySelector('.carousel-lightbox-next');

    let lbImages = [];
    let lbIndex  = 0;

    function openLightbox(images, index) {
        lbImages = images;
        lbIndex  = index;
        lbImg.src = lbImages[lbIndex];
        lightbox.classList.add('active');
        lbPrev.style.display = lbImages.length > 1 ? '' : 'none';
        lbNext.style.display = lbImages.length > 1 ? '' : 'none';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lbImg.src = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    lbPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        lbImg.src = lbImages[lbIndex];
    });

    lbNext.addEventListener('click', (e) => {
        e.stopPropagation();
        lbIndex = (lbIndex + 1) % lbImages.length;
        lbImg.src = lbImages[lbIndex];
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; lbImg.src = lbImages[lbIndex]; }
        if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; lbImg.src = lbImages[lbIndex]; }
    });

    // Init each carousel
    const carousels = document.querySelectorAll('.carousel-wrapper');

    carousels.forEach(wrapper => {
        const inner      = wrapper.querySelector('.carousel-inner');
        const prevButton = wrapper.querySelector('.carousel-control.prev');
        const nextButton = wrapper.querySelector('.carousel-control.next');
        const images     = Array.from(inner.querySelectorAll('img'));

        if (images.length === 0) return;

        let currentIndex = 0;

        function updateCarousel() {
            inner.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel();
        });

        // Preview button
        const previewBtn = document.createElement('button');
        previewBtn.className = 'carousel-preview-btn';
        previewBtn.title = 'Ver imagen ampliada';
        previewBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><polyline points="0,4 0,0 4,0"/><polyline points="10,0 14,0 14,4"/><polyline points="14,10 14,14 10,14"/><polyline points="4,14 0,14 0,10"/></svg>';
        wrapper.appendChild(previewBtn);

        previewBtn.addEventListener('click', () => {
            const srcs = images.map(img => img.src);
            openLightbox(srcs, currentIndex);
        });

        updateCarousel();
    });
});

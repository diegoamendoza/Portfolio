document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel-wrapper');

    carousels.forEach(wrapper => {
        const inner = wrapper.querySelector('.carousel-inner');
        const prevButton = wrapper.querySelector('.carousel-control.prev');
        const nextButton = wrapper.querySelector('.carousel-control.next');
        const images = inner.querySelectorAll('img');

        if (images.length === 0) return;

        let currentIndex = 0;
        const totalImages = images.length;

        function updateCarousel() {
            const width = inner.clientWidth;
            inner.style.transform = `translateX(-${currentIndex * width}px)`;
        }

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateCarousel();
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            updateCarousel();
        });

        // Optional: Recalculate on window resize
        window.addEventListener('resize', updateCarousel);

        // Initial position
        updateCarousel();
    });
});

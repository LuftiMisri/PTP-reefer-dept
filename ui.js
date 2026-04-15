(function (window) {
    let aboutSlideshowTimer = null;

    function toggleMobileMenu() {
        const menu = document.getElementById("mobile-menu");
        if (menu) menu.classList.toggle("hidden");
    }

    function toggleModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.toggle("hidden");
        document.body.style.overflow = modal.classList.contains("hidden") ? "auto" : "hidden";
    }

    function initLoginErrorFromQuery() {
        const params = new URLSearchParams(window.location.search);
        if (params.get("error") === "invalid") {
            const errEl = document.getElementById("login-error");
            if (errEl) errEl.classList.remove("hidden");
        }
    }

    function initSmoothAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                const targetId = this.getAttribute("href");
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({ top: targetElement.offsetTop - 80, behavior: "smooth" });
                    const menu = document.getElementById("mobile-menu");
                    if (menu) menu.classList.add("hidden");
                }
            });
        });
    }

    function initHeroTitleAnimation() {
        const heroTitle = document.getElementById("hero-title");
        if (!heroTitle) return;
        requestAnimationFrame(() => {
            heroTitle.classList.add("is-visible");
        });
    }

    function initAboutMainTitleAnimation() {
        const title = document.getElementById("about-main-title");
        if (!title) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    title.classList.add("is-visible");
                    obs.unobserve(title);
                }
            });
        }, { threshold: 0.35 });

        observer.observe(title);
    }

    function initAboutCardRotator() {
        const rotator = document.getElementById("about-rotator");
        const dotsWrap = document.getElementById("about-rotator-dots");
        const cards = rotator ? Array.from(rotator.querySelectorAll(".about-card")) : [];
        if (!cards.length || !dotsWrap) return;

        let current = 0;
        let rotationId;

        function syncHeight() {
            const tallest = cards.reduce((maxHeight, card) => Math.max(maxHeight, card.scrollHeight), 0);
            rotator.style.minHeight = tallest + "px";
        }

        const dots = cards.map((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "about-rotator-dot";
            dot.setAttribute("aria-label", "Show about card " + (index + 1));
            dot.addEventListener("click", () => {
                current = index;
                render();
                restartRotation();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function render() {
            cards.forEach((card, index) => {
                card.classList.toggle("is-active", index === current);
            });
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-active", index === current);
            });
        }

        function next() {
            current = (current + 1) % cards.length;
            render();
        }

        function restartRotation() {
            clearInterval(rotationId);
            rotationId = setInterval(next, 6500);
        }

        function stopRotation() {
            clearInterval(rotationId);
        }

        syncHeight();
        render();
        restartRotation();

        rotator.addEventListener("mouseenter", stopRotation);
        rotator.addEventListener("mouseleave", restartRotation);
        dotsWrap.addEventListener("mouseenter", stopRotation);
        dotsWrap.addEventListener("mouseleave", restartRotation);
        window.addEventListener("resize", syncHeight);
    }

    function initKpiSlider() {
        const track = document.getElementById("kpiTrack");
        const prevBtn = document.getElementById("kpiPrev");
        const nextBtn = document.getElementById("kpiNext");
        const dotsWrap = document.getElementById("kpiDots");
        if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

        const totalSlides = track.children.length;
        let current = 0;
        let autoplayId;

        const dots = Array.from({ length: totalSlides }, (_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "h-2.5 w-2.5 rounded-full bg-slate-500/70 transition-all";
            dot.setAttribute("aria-label", "Go to KPI slide " + (index + 1));
            dot.addEventListener("click", () => {
                current = index;
                render();
                restartAutoplay();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function render() {
            track.style.transform = "translateX(-" + (current * 100) + "%)";
            dots.forEach((dot, index) => {
                dot.className = index === current
                    ? "h-2.5 w-6 rounded-full bg-blue-400 transition-all"
                    : "h-2.5 w-2.5 rounded-full bg-slate-500/70 transition-all";
            });
        }

        function next() {
            current = (current + 1) % totalSlides;
            render();
        }

        function prev() {
            current = (current - 1 + totalSlides) % totalSlides;
            render();
        }

        function restartAutoplay() {
            clearInterval(autoplayId);
            autoplayId = setInterval(next, 4500);
        }

        function stopAutoplay() {
            clearInterval(autoplayId);
        }

        nextBtn.addEventListener("click", () => {
            next();
            restartAutoplay();
        });

        prevBtn.addEventListener("click", () => {
            prev();
            restartAutoplay();
        });

        track.addEventListener("mouseenter", stopAutoplay);
        track.addEventListener("mouseleave", restartAutoplay);
        dotsWrap.addEventListener("mouseenter", stopAutoplay);
        dotsWrap.addEventListener("mouseleave", restartAutoplay);

        render();
        restartAutoplay();
    }

    // Fetches images for the about page slideshow and initializes the rotation with fade transition.

    async function initAboutImageSlideshow() {
        const imgEl = document.getElementById("about-display-img");
        if (!imgEl) return;

        imgEl.removeAttribute("src");
        imgEl.style.visibility = "hidden";

        if (aboutSlideshowTimer) {
            clearInterval(aboutSlideshowTimer);
            aboutSlideshowTimer = null;
        }

        try {
            const response = await fetch("/api/images?category=gallery", {
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rows = await response.json();

            const pics = Array.isArray(rows)
                ? rows
                    .map((row) => ({
                        src: row.image_path || row.path || row.filepath || row.url || row.filename,
                        alt: row.alt_text || "Gallery image"
                    }))
                    .filter((pic) => pic.src)
                : [];

            if (!pics.length) {
                console.warn("No slideshow images found for category: gallery");
                return;
            }

            let idx = 0;
            imgEl.src = pics[idx].src;
            imgEl.alt = pics[idx].alt;
            imgEl.style.visibility = "visible";

            aboutSlideshowTimer = window.setInterval(() => {
                idx = (idx + 1) % pics.length;
                imgEl.classList.add("opacity-0");

                window.setTimeout(() => {
                    imgEl.src = pics[idx].src;
                    imgEl.alt = pics[idx].alt;
                    imgEl.classList.remove("opacity-0");
                }, 500);
            }, 4000);
        } catch (error) {
            console.error("Failed to load slideshow images:", error);
        }
    }

    window.toggleMobileMenu = toggleMobileMenu;
    window.toggleModal = toggleModal;

    window.AppUi = {
        initLoginErrorFromQuery,
        initSmoothAnchorScroll,
        initHeroTitleAnimation,
        initAboutMainTitleAnimation,
        initAboutCardRotator,
        initKpiSlider,
        initAboutImageSlideshow
    };
})(window);

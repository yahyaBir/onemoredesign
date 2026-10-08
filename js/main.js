/* =========================================
   ELEMENTS
========================================= */

const siteHeader = document.getElementById("siteHeader");

const menuToggle = document.getElementById("menuToggle");

const mobileMenu = document.getElementById("mobileMenu");

const heroVideo = document.getElementById("heroVideo");



/* =========================================
   MOBILE MENU
========================================= */

function openMenu() {

    mobileMenu.classList.add("is-open");

    menuToggle.classList.add("is-active");

    document.body.classList.add("menu-open");


    menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );


    menuToggle.setAttribute(
        "aria-label",
        "Menüyü kapat"
    );

}



function closeMenu() {

    mobileMenu.classList.remove("is-open");

    menuToggle.classList.remove("is-active");

    document.body.classList.remove("menu-open");


    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );


    menuToggle.setAttribute(
        "aria-label",
        "Menüyü aç"
    );

}



menuToggle.addEventListener(
    "click",
    () => {

        const menuIsOpen =
            mobileMenu.classList.contains("is-open");


        if (menuIsOpen) {

            closeMenu();

        } else {

            openMenu();

        }

    }
);



/* =========================================
   CLOSE MOBILE MENU WHEN LINK CLICKED
========================================= */

const mobileLinks =
    mobileMenu.querySelectorAll("a");


mobileLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                closeMenu();

            }
        );

    }
);



/* =========================================
   CLOSE MOBILE MENU AFTER RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 1180) {

            closeMenu();

        }

    }
);



/* =========================================
   NAVBAR SCROLL EFFECT
========================================= */

function updateHeader() {

    if (window.scrollY > 30) {

        siteHeader.classList.add(
            "is-scrolled"
        );

    } else {

        siteHeader.classList.remove(
            "is-scrolled"
        );

    }

}


updateHeader();


window.addEventListener(
    "scroll",
    updateHeader,
    {
        passive: true
    }
);



/* =========================================
   HERO VIDEO PERFORMANCE
========================================= */

if (heroVideo) {
    // One source at a time; desktop video is never requested on a portrait phone.
    const mobileMedia = window.matchMedia("(max-width: 900px) and (orientation: portrait)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let selectedSource = "";

    function updatePlayback() {
        if (reducedMotion.matches || document.hidden || !visible) {
            heroVideo.pause();
            return;
        }
        heroVideo.play().catch(() => { /* Poster remains if autoplay is blocked. */ });
    }

    function selectSource() {
        if (reducedMotion.matches) {
            heroVideo.pause();
            heroVideo.classList.remove("is-playing");
            heroVideo.removeAttribute("src");
            selectedSource = "";
            heroVideo.load();
            return;
        }
        const source = mobileMedia.matches ? heroVideo.dataset.mobile : heroVideo.dataset.desktop;
        if (source !== selectedSource) {
            selectedSource = source;
            heroVideo.classList.remove("is-playing");
            heroVideo.src = source;
            heroVideo.load();
        }
        updatePlayback();
    }

    heroVideo.addEventListener("playing", () => heroVideo.classList.add("is-playing"));
    heroVideo.addEventListener("error", () => heroVideo.classList.remove("is-playing"));
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
    }, { threshold: 0.1 }).observe(heroVideo);
    document.addEventListener("visibilitychange", updatePlayback);
    mobileMedia.addEventListener("change", selectSource);
    reducedMotion.addEventListener("change", selectSource);
    selectSource();
}

/* =========================================
   DESIGN TIMELINE
========================================= */

const designTimeline =
    document.getElementById("designTimeline");

const timelineProgress =
    document.getElementById("timelineProgress");


if (designTimeline && timelineProgress) {

    const timelineItems =
        Array.from(
            designTimeline.querySelectorAll(
                "[data-timeline-item]"
            )
        );


    let activeIndex = -1;


    /*
     * Bir aşamayı aktif hale getir.
     */

    function activateTimelineItem(index) {

        activeIndex = index;


        timelineItems.forEach(
            (item, itemIndex) => {

                const trigger =
                    item.querySelector(
                        ".timeline__trigger"
                    );


                const isActive =
                    itemIndex <= index;


                item.classList.toggle(
                    "is-active",
                    isActive
                );


                trigger.setAttribute(
                    "aria-expanded",
                    itemIndex === index
                        ? "true"
                        : "false"
                );

            }
        );


        updateTimelineProgress();

    }



    /*
     * Progress line
     */

    function updateTimelineProgress() {

        if (activeIndex < 0) {
            return;
        }


        const percentage =
            timelineItems.length === 1
                ? 100
                : (
                    activeIndex /
                    (timelineItems.length - 1)
                ) * 100;


        if (window.innerWidth <= 650) {

            timelineProgress.style.width =
                "100%";

            timelineProgress.style.height =
                `${percentage}%`;

        } else {

            timelineProgress.style.height =
                "100%";

            timelineProgress.style.width =
                `${percentage}%`;

        }

    }



    /*
     * Timeline ekrana geldiğinde
     * aşamaları sırayla aktive ediyoruz.
     */

    const timelineObserver =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach(
                    (entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        timelineItems.forEach(
                            (item, index) => {

                                setTimeout(
                                    () => {

                                        activateTimelineItem(
                                            index
                                        );

                                    },
                                    index * 180
                                );

                            }
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },

            {
                threshold: 0.3
            }

        );


    timelineObserver.observe(
        designTimeline
    );



    /*
     * Kullanıcı herhangi bir timeline
     * aşamasına tıklayabilir.
     */

    timelineItems.forEach(
        (item, index) => {

            const trigger =
                item.querySelector(
                    ".timeline__trigger"
                );


            trigger.addEventListener(
                "click",
                () => {

                    activateTimelineItem(
                        index
                    );

                }
            );

        }
    );



    /*
     * Desktop / mobile arasında geçerken
     * progress yönünü tekrar hesapla.
     */

    window.addEventListener(
        "resize",
        updateTimelineProgress
    );

}

/* =========================================
   PROCESS TIMELINE
========================================= */

const processSection =
    document.querySelector(".process");

const processProgress =
    document.getElementById("processProgress");

const processSteps =
    Array.from(
        document.querySelectorAll(
            "[data-process-step]"
        )
    );


if (
    processSection &&
    processProgress &&
    processSteps.length
) {

    let currentStep = -1;


    function activateProcessStep(index) {

        currentStep = index;


        processSteps.forEach(
            (step, stepIndex) => {

                step.classList.toggle(
                    "is-active",
                    stepIndex <= index
                );

            }
        );


        updateProcessProgress();

    }


    function updateProcessProgress() {

        if (currentStep < 0) {
            return;
        }


        const progress =
            processSteps.length === 1
                ? 100
                : (
                    currentStep /
                    (processSteps.length - 1)
                ) * 100;


        if (window.innerWidth <= 650) {

            processProgress.style.width =
                "100%";

            processProgress.style.height =
                `${progress}%`;

        } else {

            processProgress.style.height =
                "100%";

            processProgress.style.width =
                `${progress}%`;

        }

    }


    const processObserver =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach(
                    (entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        processSteps.forEach(
                            (step, index) => {

                                setTimeout(
                                    () => {

                                        activateProcessStep(
                                            index
                                        );

                                    },
                                    index * 200
                                );

                            }
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },

            {
                threshold: 0.25
            }

        );


    processObserver.observe(
        processSection
    );


    window.addEventListener(
        "resize",
        updateProcessProgress
    );

}
// Hide while moving down; show when moving up, near the top, or using the menu.
(() => {
    let previousY = window.scrollY;
    let distance = 0;
    window.addEventListener('scroll', () => {
        const y = Math.max(0, window.scrollY);
        const delta = y - previousY;
        previousY = y;
        if (y < 90 || document.body.classList.contains('menu-open')) {
            siteHeader.classList.remove('is-hidden'); distance = 0; return;
        }
        if (Math.sign(delta) !== Math.sign(distance)) distance = 0;
        distance += delta;
        if (Math.abs(distance) > 12) {
            siteHeader.classList.toggle('is-hidden', distance > 0);
            distance = 0;
        }
    }, {passive:true});
    siteHeader.addEventListener('focusin', () => siteHeader.classList.remove('is-hidden'));
})();

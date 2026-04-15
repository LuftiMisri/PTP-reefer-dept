(function (window, document) {
    function run() {
        if (window.AppUi) {
            window.AppUi.initLoginErrorFromQuery();
            window.AppUi.initSmoothAnchorScroll();
            window.AppUi.initHeroTitleAnimation();
            window.AppUi.initAboutMainTitleAnimation();
            window.AppUi.initAboutCardRotator();
            window.AppUi.initKpiSlider();
            window.AppUi.initAboutImageSlideshow();
        }

        if (window.AppApi) {
            window.AppApi.initDbMetaImages();
            window.AppApi.initDbBackgrounds();
            window.AppApi.initDbImages();
            window.AppApi.initTeamData();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})(window, document);

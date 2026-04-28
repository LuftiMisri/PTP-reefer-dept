(function (window) {
    let imageCatalogPromise;

    function normalizePath(rawPath) {
        if (!rawPath) return "";
        const forward = String(rawPath).replace(/\\/g, "/");
        if (/^https?:\/\//i.test(forward)) return forward;
        const withoutDrive = forward.replace(/^[a-zA-Z]:\//, "/");
        const withoutWorkspace = withoutDrive.replace(/^\/WEBSITE\//i, "/");
        const withoutRootWorkspace = withoutWorkspace.replace(/^WEBSITE\//i, "");
        return withoutRootWorkspace.startsWith("/") ? withoutRootWorkspace : "/" + withoutRootWorkspace;
    }

    function fetchJson(url) {
        return fetch(url).then((response) => {
            if (!response.ok) {
                throw new Error("Request failed: " + response.status);
            }
            return response.json();
        });
    }

    function getImageCatalog() {
        if (!imageCatalogPromise) {
            imageCatalogPromise = fetchJson("/api/images")
                .then((rows) => {
                    if (!Array.isArray(rows)) return [];

                    return rows.map((row) => {
                        const rawPath = row.image_path || row.path || row.filepath || row.url || "";
                        const normalizedPath = normalizePath(rawPath);
                        const filename = String(
                            row.filename || (normalizedPath ? normalizedPath.split("/").pop() : "")
                        ).trim();

                        return {
                            ...row,
                            filename,
                            normalizedPath,
                            category: String(row.category || "").trim()
                        };
                    }).filter((row) => row.normalizedPath);
                })
                .catch((error) => {
                    imageCatalogPromise = null;
                    throw error;
                });
        }

        return imageCatalogPromise;
    }

    function matchesImage(image, criteria) {
        const wantedFilename = String(criteria.filename || "").trim().toLowerCase();
        const wantedCategory = String(criteria.category || "").trim().toLowerCase();
        const imageFilename = String(image.filename || "").trim().toLowerCase();
        const imageCategory = String(image.category || "").trim().toLowerCase();

        const filenameMatches = !wantedFilename || imageFilename === wantedFilename;
        const categoryMatches = !wantedCategory || imageCategory === wantedCategory;

        return filenameMatches && categoryMatches;
    }

    function findImage(rows, criteria) {
        if (!Array.isArray(rows) || !rows.length) return null;

        return rows.find((image) => matchesImage(image, criteria))
            || rows.find((image) => matchesImage(image, { filename: criteria.filename }))
            || rows.find((image) => matchesImage(image, { category: criteria.category }))
            || null;
    }

    function toAbsoluteUrl(imageUrl) {
        if (!imageUrl) return "";
        if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
        return new URL(imageUrl, window.location.origin).href;
    }

    function initDbImages() {
        const imageNodes = Array.from(document.querySelectorAll("img[data-image-filename]"));
        if (!imageNodes.length) return;

        imageNodes.forEach((node) => {
            node.removeAttribute("src");
            node.style.visibility = "hidden";
        });

        getImageCatalog()
            .then((rows) => {
                imageNodes.forEach((node) => {
                    const match = findImage(rows, {
                        filename: node.dataset.imageFilename,
                        category: node.dataset.imageCategory
                    });

                    if (!match) return;

                    node.src = match.normalizedPath;
                    if (match.alt_text) {
                        node.alt = match.alt_text;
                    }
                    node.style.visibility = "visible";
                });
            })
            .catch(() => {
                // keep DB-only rendering when image catalog is unavailable
            });
    }

    function initDbBackgrounds() {
        const backgroundNodes = Array.from(document.querySelectorAll("[data-bg-image-filename]"));
        if (!backgroundNodes.length) return;

        getImageCatalog()
            .then((rows) => {
                backgroundNodes.forEach((node) => {
                    const match = findImage(rows, {
                        filename: node.dataset.bgImageFilename,
                        category: node.dataset.bgImageCategory
                    });

                    if (!match) return;

                    const overlay = node.dataset.bgOverlay;
                    node.style.backgroundImage = overlay
                        ? overlay + ", url('" + match.normalizedPath + "')"
                        : "url('" + match.normalizedPath + "')";
                });
            })
            .catch(() => {
                // keep CSS fallback backgrounds when DB images are unavailable
            });
    }

    function initDbMetaImages() {
        const metaNodes = Array.from(document.querySelectorAll("meta[data-image-filename]"));
        if (!metaNodes.length) return;

        getImageCatalog()
            .then((rows) => {
                metaNodes.forEach((node) => {
                    const match = findImage(rows, {
                        filename: node.dataset.imageFilename,
                        category: node.dataset.imageCategory
                    });

                    if (!match) return;

                    node.setAttribute("content", toAbsoluteUrl(match.normalizedPath));
                });
            })
            .catch(() => {
                // leave meta content unchanged when DB images are unavailable
            });
    }

    function initTeamData() {
        const managementGrid = document.getElementById("managementGrid");
        const execGrid = document.getElementById("execGrid");
        if (!managementGrid || !execGrid) return;

        function buildManagementCard(member) {
            const imagePath = normalizePath(member.image_path);
            return "\n                <div class=\"bg-white p-8 rounded-xl border border-slate-200 profile-card\">\n                    <div class=\"flex items-center space-x-4 mb-6\">\n                        <div class=\"w-16 h-16 rounded-full overflow-hidden\">\n                            <img src=\"" + imagePath + "\" alt=\"" + member.name + "\" class=\"w-full h-full object-cover\"\n                                onerror=\"this.style.visibility='hidden'\">\n                        </div>\n                        <div>\n                            <h4 class=\"text-lg font-bold text-slate-900 leading-tight\">" + member.name + "</h4>\n                            <p class=\"text-blue-600 text-xs font-semibold uppercase tracking-wider\">" + member.role + "</p>\n                        </div>\n                    </div>\n                    <p class=\"text-sm text-slate-600 leading-tight\">" + (member.description || "") + "</p>\n                </div>";
        }

        function buildExecCard(member) {
            const imagePath = normalizePath(member.image_path);
            return "\n                <div class=\"bg-white p-5 rounded-lg border border-slate-200 shadow-sm profile-card flex space-x-4 items-center\">\n                    <div class=\"exec-img-container\">\n                        <img src=\"" + imagePath + "\" alt=\"" + member.name + "\" class=\"exec-img\"\n                            onerror=\"this.style.visibility='hidden'\">\n                    </div>\n                    <div>\n                        <h6 class=\"font-bold text-slate-900 leading-none mb-1\">" + member.name + "</h6>\n                        <p class=\"text-xs text-blue-600 font-bold uppercase tracking-wider mb-2\">" + member.role + "</p>\n                        <p class=\"text-sm text-slate-600 leading-tight\">" + (member.description || "") + "</p>\n                    </div>\n                </div>";
        }

        fetchJson("/api/team")
            .then((members) => {
                const mgmt = members.filter((member) => member.role_group === "management");
                const execs = members.filter((member) => member.role_group === "executive");
                managementGrid.innerHTML = mgmt.map(buildManagementCard).join("");
                execGrid.innerHTML = execs.map(buildExecCard).join("");
            })
            .catch(() => {
                managementGrid.innerHTML = "<p class=\"text-slate-400 col-span-3 text-sm\">Team data unavailable.</p>";
                execGrid.innerHTML = "<p class=\"text-slate-400 col-span-3 text-sm\">Team data unavailable.</p>";
            });
    }

    window.AppApi = {
        initDbImages,
        initDbBackgrounds,
        initDbMetaImages,
        initTeamData
    };
})(window);

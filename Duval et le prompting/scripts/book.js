const pageSections = document.querySelectorAll("[data-page]");
const progressLinks = document.querySelectorAll(".progress-link");
const progressFill = document.querySelector("[data-progress-fill]");

if (pageSections.length && progressLinks.length) {
  const setActiveLink = (id) => {
    progressLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.dataset.active = isActive ? "true" : "false";
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (activeEntry) {
        setActiveLink(activeEntry.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -45% 0px",
      threshold: [0.2, 0.45, 0.7],
    },
  );

  pageSections.forEach((section) => observer.observe(section));
}

if (progressFill) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

const zoomableImages = document.querySelectorAll(".zoomable-media");

if (zoomableImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Agrandissement de l'image">
      <button class="lightbox-close" type="button" aria-label="Fermer">×</button>
      <img alt="" />
      <p class="lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  let lastTrigger = null;

  const closeLightbox = () => {
    lightbox.dataset.open = "false";
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastTrigger) {
      lastTrigger.focus();
    }
  };

  const openLightbox = (image) => {
    lastTrigger = image;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Image agrandie";
    lightboxCaption.textContent = image.alt || "";
    lightbox.dataset.open = "true";
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };

  zoomableImages.forEach((image) => {
    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.dataset.open === "true") {
      closeLightbox();
    }
  });
}

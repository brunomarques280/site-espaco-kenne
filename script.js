const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const header = document.querySelector(".header");
const yearElement = document.getElementById("year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const fallbackImageMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7e7df"/>
      <stop offset="100%" stop-color="#edd4dc"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#bg)"/>
  <circle cx="220" cy="220" r="90" fill="#9b4f68" opacity="0.36"/>
  <circle cx="980" cy="1260" r="120" fill="#9b4f68" opacity="0.32"/>
  <text x="50%" y="48%" text-anchor="middle" fill="#5d2f40" font-size="62" font-family="Arial, sans-serif" font-weight="700">
    Salao da Kau
  </text>
  <text x="50%" y="54%" text-anchor="middle" fill="#5d2f40" font-size="36" font-family="Arial, sans-serif">
    Imagem em atualizacao
  </text>
</svg>`;
const fallbackImageDataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackImageMarkup)}`;

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    nav.classList.toggle("open");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (nav?.classList.contains("open")) {
      nav.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("click", (event) => {
  if (!nav || !menuToggle) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const clickedInsideNav = nav.contains(target);
  const clickedToggle = menuToggle.contains(target);

  if (!clickedInsideNav && !clickedToggle && nav.classList.contains("open")) {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

const updateHeaderState = () => {
  if (!header) {
    return;
  }
  header.classList.toggle("scrolled", window.scrollY > 8);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const revealSoftTargets = document.querySelectorAll(
  ".proof-card, .service-card, .diff-card, .gallery-item, .testimonial-card, .location-info, .map-wrap, .final-cta-content"
);
revealSoftTargets.forEach((target) => target.classList.add("reveal-soft"));

const revealTargets = document.querySelectorAll(".reveal, .reveal-soft");
if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((target, index) => {
    const delay = Math.min(index * 55, 420);
    target.style.setProperty("--reveal-delay", `${delay}ms`);
    revealObserver.observe(target);
  });
}

const applyImageFallback = (imageElement) => {
  if (!(imageElement instanceof HTMLImageElement)) {
    return;
  }

  const fallbackSrc = imageElement.dataset.fallbackSrc;
  const fallbackTried = imageElement.dataset.fallbackTried === "true";
  const placeholderSet = imageElement.dataset.placeholderSet === "true";

  if (fallbackSrc && !fallbackTried) {
    imageElement.dataset.fallbackTried = "true";
    imageElement.src = fallbackSrc;
    return;
  }

  if (!placeholderSet) {
    imageElement.dataset.placeholderSet = "true";
    imageElement.classList.add("image-fallback");
    imageElement.src = fallbackImageDataUri;
  }
};

const imagesWithFallback = document.querySelectorAll("img[data-fallback-src]");
imagesWithFallback.forEach((imageElement) => {
  imageElement.addEventListener("error", () => applyImageFallback(imageElement));
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const galleryItems = document.querySelectorAll(".gallery-item");

const closeLightbox = () => {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden", "true");
};

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.dataset.image;
    const caption = item.dataset.caption || "";
    const preview = item.querySelector("img");

    if (!lightbox || !lightboxImage || !preview) {
      return;
    }

    lightboxImage.classList.remove("image-fallback");
    lightboxImage.dataset.fallbackTried = "false";
    lightboxImage.dataset.placeholderSet = "false";
    lightboxImage.dataset.fallbackSrc = preview.dataset.fallbackSrc || preview.src;
    lightboxImage.src = image || preview.src;
    lightboxImage.alt = preview.alt;
    lightboxCaption.textContent = caption;

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

lightboxImage?.addEventListener("error", () => {
  if (!lightboxImage) {
    return;
  }
  applyImageFallback(lightboxImage);
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

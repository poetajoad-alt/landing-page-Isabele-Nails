
/* Portfólio editorial + avaliações oficiais opcionais. */
(function () {
  "use strict";
  const gallery = document.getElementById("portfolio-gallery");
  const cards = gallery ? Array.from(gallery.querySelectorAll(".portfolio-item")) : [];
  const current = document.getElementById("portfolio-current");
  const modal = document.getElementById("portfolio-lightbox");
  const modalImage = document.getElementById("portfolio-lightbox-image");
  const modalCaption = document.getElementById("portfolio-lightbox-caption");
  const closeButton = modal ? modal.querySelector(".portfolio-lightbox-close") : null;
  let lastFocus = null;

  function galleryIndex() {
    if (!gallery || !cards.length) return 0;
    const offset = gallery.scrollLeft;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach(function (card, index) {
      const delta = Math.abs(card.offsetLeft - gallery.offsetLeft - offset);
      if (delta < distance) { distance = delta; nearest = index; }
    });
    return nearest;
  }
  function updateCounter() {
    if (current) current.textContent = String(galleryIndex() + 1).padStart(2, "0");
  }
  if (gallery) {
    gallery.addEventListener("scroll", updateCounter, { passive: true });
    gallery.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = Math.max(0, Math.min(cards.length - 1, galleryIndex() + step));
        cards[next].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    });
  }
  document.querySelectorAll("[data-gallery-direction]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!gallery || !cards.length) return;
      const step = Number(button.dataset.galleryDirection) || 1;
      const next = Math.max(0, Math.min(cards.length - 1, galleryIndex() + step));
      cards[next].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    });
  });
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("portfolio-modal-open");
    if (modalImage) modalImage.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (!modal || !modalImage || !modalCaption) return;
      lastFocus = document.activeElement;
      modalImage.src = card.dataset.portfolioImage;
      modalImage.alt = card.querySelector("img") ? card.querySelector("img").alt : "";
      modalCaption.textContent = card.dataset.portfolioCaption || "";
      modal.hidden = false;
      document.body.classList.add("portfolio-modal-open");
      if (closeButton) closeButton.focus();
      if (typeof trackLandingEvent === "function") trackLandingEvent("landing_portfolio_aberto");
    });
  });
  if (closeButton) closeButton.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (event) { if (event.target === modal) closeModal(); });
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
      if (event.key === "Tab" && closeButton) {
        event.preventDefault();
        closeButton.focus();
      }
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeModal();
  });

  function safeHttps(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch (_) { return ""; }
  }
  function makeLink(text, href, className) {
    const link = document.createElement("a");
    link.textContent = text;
    link.className = className;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }
  async function loadGoogleReviews() {
    const container = document.getElementById("google-reviews-data");
    const list = document.getElementById("google-reviews-list");
    const rating = document.getElementById("google-reviews-rating");
    const count = document.getElementById("google-reviews-count");
    if (!container || !list || !rating || !count) return;
    try {
      const response = await fetch("/api/google-reviews", { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data.rating !== "number" || !Number.isFinite(data.rating)) return;
      rating.textContent = data.rating.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
      count.textContent = (Number(data.total) || 0).toLocaleString("pt-BR") + " avaliações no Google Maps";
      list.replaceChildren();
      (Array.isArray(data.reviews) ? data.reviews : []).slice(0, 3).forEach(function (review) {
        if (!review.text || !review.author) return;
        const card = document.createElement("article");
        card.className = "google-review-card";
        const stars = document.createElement("div");
        stars.className = "google-review-stars";
        stars.setAttribute("aria-label", String(review.rating) + " de 5 estrelas");
        stars.textContent = "★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)));
        const quote = document.createElement("blockquote");
        quote.textContent = review.text;
        const author = document.createElement("span");
        author.className = "google-review-author";
        author.textContent = review.author;
        card.append(stars, quote, author);
        const link = safeHttps(review.googleMapsUri);
        if (link) card.append(makeLink("Ler no Google Maps ↗", link, "google-review-link"));
        list.append(card);
      });
      container.hidden = false;
      if (!list.children.length) list.hidden = true;
    } catch (_) {
      // Sites estáticos ou API ainda não configurada: mantém convite oficial sem inventar avaliações.
    }
  }
  loadGoogleReviews();
  const reviewLink = document.getElementById("review-google-link");
  if (reviewLink) reviewLink.addEventListener("click", function () {
    if (typeof trackLandingEvent === "function") trackLandingEvent("landing_google_avaliar_click");
  });
  document.querySelectorAll(".service-learn").forEach(function (link) {
    link.addEventListener("click", function () {
      if (typeof trackLandingEvent === "function") trackLandingEvent("landing_servico_blog_click", { destino: link.getAttribute("href") });
    });
  });
})();

/* Carrossel progressivo: o swipe CSS continua funcionando sem JavaScript. */
(() => {
  "use strict";
  const root = document.querySelector("[data-home-blog-carousel]");
  if (!root) return;
  const track = root.querySelector(".home-blog__mini-track");
  const slides = track ? Array.from(track.querySelectorAll(".home-blog__mini-card")) : [];
  if (!track || slides.length < 2) return;

  const prev = root.querySelector("[data-home-blog-prev]");
  const next = root.querySelector("[data-home-blog-next]");
  const dots = Array.from(root.querySelectorAll("[data-home-blog-dot]"));
  const mobile = window.matchMedia("(max-width: 650px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let pending = false;

  function render(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
      if (i === current) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === slides.length - 1;
  }
  function navigate(index) {
    if (!mobile.matches) return;
    const i = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[i].offsetLeft - slides[0].offsetLeft,
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
    render(i);
  }
  prev?.addEventListener("click", () => navigate(current - 1));
  next?.addEventListener("click", () => navigate(current + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => navigate(i)));
  track.addEventListener("keydown", (event) => {
    if (!mobile.matches || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    navigate(current + (event.key === "ArrowRight" ? 1 : -1));
  });
  track.addEventListener("scroll", () => {
    if (!mobile.matches || pending) return;
    pending = true;
    window.requestAnimationFrame(() => {
      pending = false;
      render(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    });
  }, { passive: true });
  mobile.addEventListener("change", () => {
    if (mobile.matches) navigate(current);
  });
  render(0);
})();

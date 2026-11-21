/* Deslize nativo com controles acessíveis quando existem vários destaques. */
(() => {
  "use strict";
  const root = document.querySelector("[data-blog-carousel]");
  if (!root) return;
  const track = root.querySelector(".blog-feature-stack");
  const slides = track ? Array.from(track.querySelectorAll(".blog-feature-card--compact")) : [];
  if (!track || slides.length < 2) return;

  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const dots = Array.from(root.querySelectorAll("[data-carousel-dot]"));
  const mobile = window.matchMedia("(max-width: 800px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let pendingScroll = false;

  function updateControls(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    dots.forEach((dot, position) => {
      dot.classList.toggle("is-active", position === current);
      if (position === current) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === slides.length - 1;
  }

  function goTo(index) {
    if (!mobile.matches) return;
    const destination = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[destination].offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    updateControls(destination);
  }

  prev?.addEventListener("click", () => goTo(current - 1));
  next?.addEventListener("click", () => goTo(current + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));

  track.addEventListener("keydown", (event) => {
    if (!mobile.matches) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    goTo(current + (event.key === "ArrowRight" ? 1 : -1));
  });

  track.addEventListener("scroll", () => {
    if (!mobile.matches || pendingScroll) return;
    pendingScroll = true;
    window.requestAnimationFrame(() => {
      pendingScroll = false;
      updateControls(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    });
  }, { passive: true });

  mobile.addEventListener("change", () => {
    if (mobile.matches) goTo(current);
  });
  updateControls(0);
})();

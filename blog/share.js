/* Compartilhamento discreto para todas as páginas de artigo.
   Stories e Direct usam o menu nativo quando disponível:
   um website não pode selecionar diretamente um destino do Instagram. */
(() => {
  "use strict";

  const root = document.querySelector("[data-article-share]");
  if (!root) return;

  const toggle = root.querySelector("[data-share-toggle]");
  const panel = root.querySelector("[data-share-panel]");
  const whatsapp = root.querySelector("[data-share-whatsapp]");
  const instagram = root.querySelector("[data-share-instagram]");
  const nativeButton = root.querySelector("[data-share-native]");
  const copyButton = root.querySelector("[data-share-copy]");
  const feedback = root.querySelector("[data-share-feedback]");
  if (!toggle || !panel || !whatsapp || !instagram || !copyButton || !feedback) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  const articleUrl = canonical && canonical.href ? canonical.href : location.href;
  const titleTag = document.querySelector('meta[property="og:title"]');
  const articleTitle = titleTag && titleTag.content ? titleTag.content : document.title;
  const shareText = "Encontrei este artigo da Isabele Mariana Nails: " + articleTitle;
  whatsapp.href = "https://api.whatsapp.com/send?text=" +
    encodeURIComponent(shareText + "\n" + articleUrl);

  if (nativeButton && typeof navigator.share !== "function") {
    nativeButton.hidden = true;
  }

  let feedbackTimer;
  function showFeedback(message) {
    feedback.textContent = message;
    feedback.hidden = false;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedback.hidden = true;
      feedback.textContent = "";
    }, 6500);
  }

  function setOpen(open, focusToggle = false) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label",
      open ? "Fechar opções de compartilhamento" : "Abrir opções de compartilhamento");
    root.classList.toggle("is-open", open);
    if (focusToggle) toggle.focus();
    if (!open) {
      clearTimeout(feedbackTimer);
      feedback.hidden = true;
      feedback.textContent = "";
    }
  }

  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(articleUrl);
        return true;
      }
      const input = document.createElement("textarea");
      input.value = articleUrl;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      input.remove();
      return ok;
    } catch (_) {
      return false;
    }
  }

  async function shareNative(kind) {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: articleTitle,
          text: "Conheça este artigo da Isabele Mariana Nails",
          url: articleUrl
        });
        setOpen(false);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    const copied = await copyLink();
    if (kind === "instagram") {
      showFeedback(copied ?
        "Link copiado! No Instagram, cole no Direct ou use a figurinha de link nos Stories." :
        "Copie o endereço do artigo no navegador para compartilhar no Instagram.");
    } else {
      showFeedback(copied ?
        "Link copiado! Cole onde quiser compartilhar." :
        "Não foi possível copiar. Copie o endereço pela barra do navegador.");
    }
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  whatsapp.addEventListener("click", () => setOpen(false));
  instagram.addEventListener("click", () => { void shareNative("instagram"); });
  if (nativeButton) {
    nativeButton.addEventListener("click", () => { void shareNative("other"); });
  }
  copyButton.addEventListener("click", async () => {
    const copied = await copyLink();
    showFeedback(copied ? "Link copiado!" :
      "Não foi possível copiar. Use o endereço da barra do navegador.");
  });

  document.addEventListener("click", (event) => {
    if (!panel.hidden && !root.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false, true);
    }
  });
  window.addEventListener("scroll", () => {
    if (!panel.hidden) setOpen(false);
  }, { passive: true });
})();

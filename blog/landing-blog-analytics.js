/* Cliques da landing para o blog: GA4, incluindo menu e cards do CMS.
   Um único listener delegado cobre links gerados nas próximas publicações. */
(() => {
  "use strict";

  function posicaoDoLink(link) {
    if (link.closest("#artigos")) return "secao_artigos";
    if (link.closest(".mobile-menu")) return "menu_mobile";
    if (link.closest(".header-nav")) return "menu_desktop";
    if (link.closest("footer")) return "rodape";
    return "outro";
  }

  function elementoDoLink(link) {
    if (link.classList.contains("home-blog__all")) return "explorar_blog";
    if (link.classList.contains("home-blog__mobile-all")) return "ver_todos";
    if (link.classList.contains("home-blog__image") ||
        link.classList.contains("home-blog__mini-media")) return "imagem_artigo";
    if (link.classList.contains("home-blog__read")) return "ler_artigo";
    if (link.closest(".home-blog__card h3, .home-blog__mini-card h4")) return "titulo_artigo";
    return "link";
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || !event.target ||
        typeof event.target.closest !== "function") return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    let destinoUrl;
    try {
      destinoUrl = new URL(link.getAttribute("href"), window.location.href);
    } catch (_) {
      return;
    }

    // Apenas links internos que levam da landing para o blog ou seus artigos.
    if (destinoUrl.origin !== window.location.origin ||
        !destinoUrl.pathname.startsWith("/blog/")) return;

    if (typeof window.gtag !== "function") return;

    const caminho = destinoUrl.pathname;
    const destino = caminho === "/blog/"
      ? "inicio_blog"
      : caminho === "/blog/todos/"
        ? "todos_artigos"
        : "artigo";
    const parametros = {
      origem: "landing_comercial",
      posicao: posicaoDoLink(link),
      destino,
      elemento: elementoDoLink(link),
      caminho_destino: caminho
    };

    const novaAba = link.target === "_blank";
    const cliqueAlternativo = event.button !== 0 || event.ctrlKey ||
      event.metaKey || event.shiftKey || event.altKey || novaAba ||
      link.hasAttribute("download");

    if (cliqueAlternativo) {
      // Respeita Ctrl/Cmd+clique, abrir em nova aba e downloads.
      window.gtag("event", "landing_blog_click", parametros);
      return;
    }

    // Evita perder o evento no carregamento da página seguinte.
    // Se a tag estiver bloqueada, o fallback permite navegar normalmente.
    event.preventDefault();
    let navegou = false;
    const navegar = () => {
      if (navegou) return;
      navegou = true;
      window.location.assign(destinoUrl.href);
    };
    window.setTimeout(navegar, 650);
    window.gtag("event", "landing_blog_click", {
      ...parametros,
      event_callback: navegar,
      event_timeout: 450
    });
  });
})();

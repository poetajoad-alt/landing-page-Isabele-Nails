<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- O gerador define robots conforme o status de publicação no CMS. -->
  <meta name="robots" content="{{ROBOTS}}">
  <title>{{SEO_TITLE}}</title>
  <meta name="description" content="{{SEO_DESCRIPTION}}">
  <link rel="canonical" href="{{CANONICAL}}">
  <link rel="icon" type="image/png" href="/assets/isabele-favicon.png">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Isabele Mariana Nails">
  <meta property="og:title" content="{{SEO_TITLE}}">
  <meta property="og:description" content="{{SEO_DESCRIPTION}}">
  <meta property="og:url" content="{{CANONICAL}}">
  <meta property="og:image" content="{{OG_IMAGE}}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{SEO_TITLE}}">
  <meta name="twitter:description" content="{{SEO_DESCRIPTION}}">
  <meta name="twitter:image" content="{{OG_IMAGE}}">
  <script type="application/ld+json">{{JSON_LD}}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/blog/blog.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-H32L5X9SS9"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-H32L5X9SS9');</script>
</head>
<body>
  <header class="site-head"><div class="wrap">
    <a class="brand" href="/" aria-label="Página inicial da Isabele Mariana Nails"><strong>Isabele Mariana</strong><small>Nails</small></a>
    <nav class="links" aria-label="Navegação do blog"><a href="/">Início</a><a href="/blog/">Blog</a><a class="pill" href="https://isabelenailsapp.vercel.app/" target="_blank" rel="noopener noreferrer">Agendar horário</a></nav>
  </div></header>
  <main class="article">
    {{ARTICLE_CONTENT}}
  </main>
  <!-- O menu e o script são compartilhados por todos os artigos gerados pelo CMS. -->
  <aside class="article-share" data-article-share aria-label="Compartilhar este artigo">
    <div id="article-share-menu" class="article-share__panel" data-share-panel hidden>
      <p class="article-share__heading">Compartilhar artigo</p>
      <a class="article-share__item article-share__item--whatsapp"
         data-share-whatsapp
         href="https://api.whatsapp.com/send?text=Leia%20este%20artigo%20da%20Isabele%20Mariana%20Nails%3A%20{{CANONICAL}}"
         target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 11.6a8.8 8.8 0 0 1-12.8 7.8L3 21l1.6-4.7a8.8 8.8 0 1 1 16.2-4.7Z"/><path d="M8.4 8.2c.5 2.8 2.7 5 5.5 5.5l1.5-1.2 2 1.1c-.6 1.8-1.8 2.4-3.5 2.1-4.4-.7-7-3.3-7.7-7.6-.3-1.7.4-2.9 2-3.5l1.1 2-1.2 1.4"/></svg>
        <span>WhatsApp<small>Enviar o link para alguém</small></span>
      </a>
      <button class="article-share__item article-share__item--instagram" type="button" data-share-instagram>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
        <span>Instagram<small>Stories ou Direct, se disponível</small></span>
      </button>
      <button class="article-share__item" type="button" data-share-native>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0-4 4m4-4 4 4"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
        <span>Outros aplicativos<small>Abrir menu do dispositivo</small></span>
      </button>
      <button class="article-share__item" type="button" data-share-copy>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
        <span>Copiar link<small>Compartilhar onde preferir</small></span>
      </button>
      <p class="article-share__hint">No celular, escolha o Instagram no menu do sistema. Para Stories com link, use a figurinha de link no aplicativo.</p>
      <p class="article-share__feedback" data-share-feedback aria-live="polite" role="status" hidden></p>
    </div>
    <button class="article-share__toggle" type="button" data-share-toggle
            aria-label="Abrir opções de compartilhamento" aria-controls="article-share-menu"
            aria-expanded="false" title="Compartilhar este artigo">
      <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <path d="m8.8 10.5 6.3-3.7m-6.3 6.7 6.3 3.7"/>
      </svg>
    </button>
  </aside>
  <script defer src="/blog/share.js"></script>
  <footer class="footer"><div class="wrap"><span>© Isabele Mariana Nails · Guarulhos, SP</span><a href="/blog/">Outros artigos</a></div></footer>
</body>
</html>

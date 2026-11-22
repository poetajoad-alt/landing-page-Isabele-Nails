/* =========================================================
   ISABELE MARIANA NAILS
   Landing Page
   ========================================================= */

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const siteConfig = {
  bookingUrl: "https://isabelenailsapp.vercel.app/",
  instagramUrl: "https://www.instagram.com/isabellemariananails/",
  whatsappNumber: "5511949494062",
  whatsappMessage:
    "Olá, Isabele! Vim pelo seu site e gostaria de saber mais sobre os atendimentos.",
};

/* =========================================================
   ANALYTICS — EVENTOS DA LANDING
   ========================================================= */

function trackLandingEvent(nome, parametros = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", nome, {
    origem: "landing_comercial",
    ...parametros,
  });
}

/* =========================================================
   ELEMENTOS
   ========================================================= */

const bookingLink = document.getElementById("booking-link");

const contactInstagramLink = document.getElementById("contact-instagram-link");



const whatsappLink = document.getElementById("whatsapp-link");

const currentYear = document.getElementById("current-year");

const internalLinks = document.querySelectorAll('a[href^="#"]');

const mobileMenuToggle = document.getElementById("mobile-menu-toggle");

const mobileMenu = document.getElementById("mobile-menu");

const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

const bottomNavItems = document.querySelectorAll(".bottom-nav-item");

/* =========================================================
   ANO AUTOMÁTICO
   ========================================================= */

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* =========================================================
   LINK DE AGENDAMENTO
   ========================================================= */

if (bookingLink) {
  bookingLink.href = siteConfig.bookingUrl;
  bookingLink.addEventListener("click", () => {
    trackLandingEvent("landing_agendamento_click", {
      destino: "aplicativo",
      posicao: "secao_agendamento",
    });
  });
}

/* Agendamento direto pelo botão fixo do cabeçalho mobile. */
const mobileHeaderBooking = document.getElementById("mobile-header-booking");
if (mobileHeaderBooking) {
  mobileHeaderBooking.href = siteConfig.bookingUrl;
  mobileHeaderBooking.addEventListener("click", () => {
    trackLandingEvent("landing_agendamento_click", {
      destino: "aplicativo",
      posicao: "cabecalho_mobile",
    });
    closeMobileMenu();
  });
}

/* =========================================================
   INSTAGRAM
   ========================================================= */

if (contactInstagramLink) {
  contactInstagramLink.href = siteConfig.instagramUrl;
  contactInstagramLink.addEventListener("click", () => {
    trackLandingEvent("landing_instagram_click", {
      destino: "instagram",
      posicao: "secao_contato",
    });
  });
}

/* =========================================================
   MENU MOBILE
   ========================================================= */

function closeMobileMenu() {
  if (!mobileMenuToggle || !mobileMenu) {
    return;
  }

  mobileMenuToggle.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");

  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-label", "Abrir menu");
}

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = mobileMenu.classList.toggle("is-open");

    mobileMenuToggle.classList.toggle("is-open", isOpen);

    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));

    mobileMenuToggle.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu",
    );
  });
}

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

document.addEventListener("click", (event) => {
  if (!mobileMenu || !mobileMenuToggle) {
    return;
  }

  const clickedInsideMenu = mobileMenu.contains(event.target);
  const clickedToggle = mobileMenuToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeMobileMenu();
  }
});

/* =========================================================
   WHATSAPP
   ========================================================= */

function createWhatsAppLink() {
  const message = encodeURIComponent(siteConfig.whatsappMessage);

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;
}

if (whatsappLink) {
  whatsappLink.href = createWhatsAppLink();
  whatsappLink.addEventListener("click", () => {
    trackLandingEvent("landing_whatsapp_click", {
      destino: "whatsapp",
      posicao: "secao_contato",
    });
  });
}

/* =========================================================
   SCROLL SUAVE
   ========================================================= */

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#" || !targetId.startsWith("#")) {
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();

    const header = document.querySelector(".header");

    const headerHeight = header ? header.offsetHeight : 0;

    const targetPosition =
      targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  });
});

/* =========================================================
   SEÇÕES VISUALIZADAS — UMA VEZ POR CARREGAMENTO
   ========================================================= */

const secoesMonitoradas = ["portfolio", "servicos", "sobre", "avaliacoes", "agendamento", "artigos", "contato"];

const observadorSecoes = new IntersectionObserver(
  (entradas, observador) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) {
        return;
      }

      trackLandingEvent("landing_secao_visualizada", {
        secao: entrada.target.id,
      });

      observador.unobserve(entrada.target);
    });
  },
  { threshold: 0.15 },
);

secoesMonitoradas.forEach((id) => {
  const secao = document.getElementById(id);
  if (secao) {
    observadorSecoes.observe(secao);
  }
});

/* =========================================================
   HEADER AO ROLAR A PÁGINA
   ========================================================= */

const header = document.querySelector(".header");

function updateHeader() {
  if (!header) {
    return;
  }

  if (window.scrollY > 20) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
}

window.addEventListener("scroll", updateHeader, {
  passive: true,
});

updateHeader();

/* =========================================================
   MENU INFERIOR - ITEM ATIVO
   ========================================================= */

const navigationSectionIds = [
  "inicio",
  "portfolio",
  "sobre",
  "agendamento",
  "contato",
];

function updateBottomNavActive() {
  if (bottomNavItems.length === 0) {
    return;
  }

  const headerOffset = header ? header.offsetHeight : 0;

  const scrollPosition = window.scrollY + headerOffset + 140;

  let activeSectionId = "inicio";

  navigationSectionIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId);

    if (section && section.offsetTop <= scrollPosition) {
      activeSectionId = sectionId;
    }
  });

  bottomNavItems.forEach((item) => {
    const itemTarget = item.getAttribute("href");

    item.classList.toggle("active", itemTarget === `#${activeSectionId}`);
  });
}

bottomNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    bottomNavItems.forEach((navItem) => {
      navItem.classList.remove("active");
    });

    item.classList.add("active");
  });
});

window.addEventListener("scroll", updateBottomNavActive, {
  passive: true,
});

updateBottomNavActive();

/* =========================================================
   ANIMAÇÃO DE ENTRADA
   ========================================================= */

const animatedElements = document.querySelectorAll(
  [
    ".section-heading",
    ".about-content",
    ".booking-content",
    ".booking-preview",
    ".portfolio-gallery",
    ".service-grid",
    ".about-editorial-grid",
    ".trust-grid",
    ".reviews-intro",
    ".contact-card",
  ].join(", "),
);

animatedElements.forEach((element) => {
  element.classList.add("reveal-element");
});

const observerOptions = {
  root: null,
  rootMargin: "0px 0px -60px 0px",
  threshold: 0.12,
};

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add("reveal-visible");

    observer.unobserve(entry.target);
  });
}, observerOptions);

animatedElements.forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================================
   LINKS EXTERNOS
   ========================================================= */

const externalLinks = document.querySelectorAll('a[target="_blank"]');

externalLinks.forEach((link) => {
  link.addEventListener("click", () => {
    link.blur();
  });
});

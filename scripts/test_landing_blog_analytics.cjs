"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const code = fs.readFileSync(path.join(__dirname, "../blog/landing-blog-analytics.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

function setup({ analytics = true } = {}) {
  const sent = [];
  const navigation = [];
  const timeouts = [];
  let click;
  const location = {
    origin: "https://isabelemariananails.com.br",
    href: "https://isabelemariananails.com.br/",
    assign: (url) => navigation.push(url)
  };
  const window = {
    location,
    setTimeout: (callback, delay) => { timeouts.push({ callback, delay }); }
  };
  if (analytics) window.gtag = (...args) => sent.push(args);
  const document = {
    addEventListener(type, listener) {
      if (type === "click") click = listener;
    }
  };
  vm.runInNewContext(code, { document, window, URL });
  assert.equal(typeof click, "function");
  const fire = (href, { scope = "menu_desktop", className = "", modifier = false, button = 0, target = "", defaultPrevented = false } = {}) => {
    let prevented = false;
    const names = new Set(className.split(" ").filter(Boolean));
    const anchor = {
      target,
      getAttribute: (name) => name === "href" ? href : null,
      hasAttribute: () => false,
      classList: { contains: (name) => names.has(name) },
      closest(selector) {
        if (selector === "#artigos") return scope === "secao_artigos" ? anchor : null;
        if (selector === ".mobile-menu") return scope === "menu_mobile" ? anchor : null;
        if (selector === ".header-nav") return scope === "menu_desktop" ? anchor : null;
        if (selector === "footer") return scope === "rodape" ? anchor : null;
        return null;
      }
    };
    const event = {
      target: { closest: (selector) => selector === "a[href]" ? anchor : null },
      button, ctrlKey: modifier, metaKey: false, shiftKey: false, altKey: false,
      defaultPrevented,
      preventDefault: () => { prevented = true; }
    };
    click(event);
    return { prevented };
  };
  return { fire, sent, navigation, timeouts };
}

test("landing carrega a tag GA4 e o script do blog uma unica vez", () => {
  assert.equal((html.match(/G-H32L5X9SS9/g) || []).length, 2);
  assert.equal((html.match(/src="\/blog\/landing-blog-analytics\.js"/g) || []).length, 1);
});

test("clique no menu contabiliza evento e navega apos callback, uma unica vez", () => {
  const { fire, sent, navigation, timeouts } = setup();
  assert.equal(fire("/blog/").prevented, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], "event");
  assert.equal(sent[0][1], "landing_blog_click");
  const p = sent[0][2];
  assert.equal(p.origem, "landing_comercial");
  assert.equal(p.posicao, "menu_desktop");
  assert.equal(p.destino, "inicio_blog");
  assert.equal(p.caminho_destino, "/blog/");
  assert.equal(p.event_timeout, 450);
  assert.equal(timeouts[0].delay, 650);
  p.event_callback();
  timeouts[0].callback();
  assert.deepEqual(navigation, ["https://isabelemariananails.com.br/blog/"]);
});

test("clique no card de artigo da secao distingue slug e imagem", () => {
  const { fire, sent } = setup();
  assert.equal(fire("/blog/artigo-teste/", {
    scope: "secao_artigos", className: "home-blog__mini-media"
  }).prevented, true);
  const p = sent[0][2];
  assert.equal(p.posicao, "secao_artigos");
  assert.equal(p.destino, "artigo");
  assert.equal(p.elemento, "imagem_artigo");
  assert.equal(p.caminho_destino, "/blog/artigo-teste/");
});

test("botao Ver todos e menu mobile sao classificados separadamente", () => {
  const { fire, sent } = setup();
  fire("/blog/todos/", { scope: "secao_artigos", className: "home-blog__mobile-all" });
  fire("/blog/", { scope: "menu_mobile" });
  assert.equal(sent[0][2].destino, "todos_artigos");
  assert.equal(sent[0][2].elemento, "ver_todos");
  assert.equal(sent[1][2].posicao, "menu_mobile");
});

test("ctrl clique nao bloqueia abertura de nova aba e ainda mede interesse", () => {
  const { fire, sent, timeouts } = setup();
  assert.equal(fire("/blog/", { modifier: true }).prevented, false);
  assert.equal(sent.length, 1);
  assert.equal(sent[0][2].event_callback, undefined);
  assert.equal(timeouts.length, 0);
});

test("se analytics estiver indisponivel nao atrasa a navegacao", () => {
  const { fire, timeouts } = setup({ analytics: false });
  assert.equal(fire("/blog/").prevented, false);
  assert.equal(timeouts.length, 0);
});

test("links externos, ancora local e outros caminhos nao disparam evento", () => {
  const { fire, sent } = setup();
  assert.equal(fire("/").prevented, false);
  assert.equal(fire("/blogue/").prevented, false);
  assert.equal(fire("https://outro.example/blog/").prevented, false);
  assert.equal(fire("#artigos").prevented, false);
  assert.equal(sent.length, 0);
});

test("fallback navega se a tag nao executar o callback", () => {
  const { fire, sent, timeouts, navigation } = setup();
  fire("/blog/todos/", { scope: "rodape" });
  assert.equal(sent[0][2].posicao, "rodape");
  assert.equal(navigation.length, 0);
  timeouts[0].callback();
  assert.deepEqual(navigation, ["https://isabelemariananails.com.br/blog/todos/"]);
});

#!/usr/bin/env python3
"""Gera o blog estático a partir dos arquivos JSON editados no Pages CMS.

Uso local para prévia: python scripts/build_blog.py --preview
Uso em produção:       python scripts/build_blog.py
Sem acesso administrativo ou credenciais externas.
"""
import argparse
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "blog" / "posts"
BLOG = ROOT / "blog"
ARTICLE_TPL = (ROOT / "templates" / "blog-article.html.tpl").read_text(encoding="utf-8")
INDEX_TPL = (ROOT / "templates" / "blog-index.html.tpl").read_text(encoding="utf-8")
SITE = "https://isabelemariananails.com.br"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
COVER = re.compile(r"^/assets/(?!.*\.\.)[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$", re.I)

def e(value):
    return html.escape(str(value if value is not None else ""), quote=True)

class ArticleHTML(HTMLParser):
    """Mantém apenas marcação editorial conhecida do editor visual."""
    allowed = {"p", "h2", "h3", "strong", "b", "em", "i", "ul",
               "ol", "li", "blockquote", "br"}
    blocked = {"script", "style", "iframe", "svg", "form", "object", "template"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.blocked:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "a":
            href = dict(attrs).get("href", "").strip()
            target = urlparse(href)
            if href.startswith("/") and not href.startswith("//"):
                self.out.append('<a href="' + e(href) + '">')
            elif target.scheme in ("https", "http") and target.netloc:
                self.out.append('<a href="' + e(href) + '" target="_blank" rel="noopener noreferrer">')
            else:
                self.out.append("<span>")
        elif tag in self.allowed:
            self.out.append("<" + tag + ">")

    def handle_endtag(self, tag):
        if tag in self.blocked:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag == "a":
            self.out.append("</a>")
        elif tag in self.allowed and tag != "br":
            self.out.append("</" + tag + ">")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(e(data))

def clean_body(source):
    parser = ArticleHTML()
    parser.feed(str(source or ""))
    return "".join(parser.out)

def render(template, tokens):
    def replacement(match):
        key = match.group(1)
        if key not in tokens:
            raise ValueError("Token do template desconhecido: " + key)
        return tokens[key]
    return re.sub(r"\{\{([A-Z_]+)\}\}", replacement, template)

def write_changed(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True

def read_posts():
    result = []
    for path in sorted(POSTS.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        required = ("title", "slug", "category", "summary", "seoTitle",
                    "seoDescription", "cover", "coverAlt", "body")
        if any(not str(data.get(field) or "").strip() for field in required):
            raise ValueError("Campos incompletos no artigo: " + path.name)
        slug = data["slug"]
        if not SLUG.fullmatch(slug) or slug != path.stem:
            raise ValueError("Slug diferente do nome do arquivo: " + path.name)
        if not COVER.fullmatch(data["cover"]):
            raise ValueError("Imagem deve estar em /assets/ e ser PNG/JPG/WebP: " + path.name)
        if not isinstance(data.get("published", False), bool):
            raise ValueError("published deve ser true/false: " + path.name)
        if len(data["seoDescription"]) > 250:
            raise ValueError("Meta description longa demais: " + path.name)
        result.append(data)
    return sorted(result, key=lambda x: x["title"].casefold())

def article_html(post, preview):
    slug = post["slug"]
    url = SITE + "/blog/" + slug + "/"
    photo = post["cover"]
    robots = "noindex,follow" if preview or not post["published"] else "index,follow"
    jsonld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url + "#artigo",
        "headline": post["title"],
        "description": post["seoDescription"],
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "image": [SITE + photo],
        "author": {"@type": "Organization", "name": "Isabele Mariana Nails"},
        "publisher": {"@type": "Organization", "name": "Isabele Mariana Nails"},
        "inLanguage": "pt-BR"
    }
    caption = post.get("coverCaption", "").strip()
    caption_html = "<figcaption>" + e(caption) + "</figcaption>" if caption else ""
    state = " · Conteúdo em revisão" if not post["published"] else ""
    article = (
        '<article class="article-content">\n'
        '  <a class="kicker" href="/blog/">← Voltar ao blog</a>\n'
        '  <span class="eyebrow">' + e(post["category"]) + '</span>\n'
        '  <h1 class="article-title">' + e(post["title"]) + '</h1>\n'
        '  <p class="article-lead">' + e(post["summary"]) + '</p>\n'
        '  <p class="meta">Blog Isabele Mariana Nails · Guarulhos, região dos Pimentas' + state + '</p>\n'
        '  <figure class="photo"><img src="' + e(photo) + '" alt="' + e(post["coverAlt"]) +
        '" width="1200" height="900" loading="eager">' + caption_html + '</figure>\n'
        '  <div class="prose">' + clean_body(post["body"]) + '</div>\n'
        '  <section class="cta" aria-label="Agendar atendimento">\n'
        '    <h2 class="section-title">Seu próximo horário está a poucos cliques.</h2>\n'
        '    <p>Consulte os serviços disponíveis e escolha seu melhor horário para atendimento.</p>\n'
        '    <a class="pill" href="https://isabelenailsapp.vercel.app/" target="_blank" rel="noopener noreferrer">Ver horários disponíveis</a>\n'
        '  </section>\n'
        '</article>'
    )
    schema = json.dumps(jsonld, ensure_ascii=False).replace("<", "\\u003c")
    return render(ARTICLE_TPL, {
        "ROBOTS": robots,
        "SEO_TITLE": e(post["seoTitle"]),
        "SEO_DESCRIPTION": e(post["seoDescription"]),
        "CANONICAL": e(url),
        "OG_IMAGE": e(SITE + photo),
        "JSON_LD": schema,
        "ARTICLE_CONTENT": article
    })

def card_html(post):
    url = "/blog/" + post["slug"] + "/"
    return (
        '<article class="feature">\n'
        '  <a href="' + e(url) + '" aria-label="Ler: ' + e(post["title"]) + '">\n'
        '    <img src="' + e(post["cover"]) + '" alt="' + e(post["coverAlt"]) +
        '" width="1200" height="900" loading="lazy"></a>\n'
        '  <div class="feature-body"><span class="eyebrow">' + e(post["category"]) + '</span>\n'
        '    <h2><a href="' + e(url) + '">' + e(post["title"]) + '</a></h2>\n'
        '    <p>' + e(post["summary"]) + '</p>\n'
        '    <a class="pill" href="' + e(url) + '">Ler artigo completo</a>\n'
        '  </div>\n'
        '</article>'
    )

def update_sitemap(published):
    sitemap = ROOT / "sitemap.xml"
    ET.register_namespace("", NS)
    tree = ET.parse(sitemap)
    root = tree.getroot()
    ns = "{" + NS + "}"
    for node in list(root):
        loc = node.find(ns + "loc")
        if loc is not None and (loc.text or "").startswith(SITE + "/blog/"):
            root.remove(node)
    if published:
        paths = ["/blog/"] + ["/blog/" + p["slug"] + "/" for p in published]
        for path in paths:
            item = ET.SubElement(root, ns + "url")
            ET.SubElement(item, ns + "loc").text = SITE + path
    ET.indent(tree, space="  ")
    new = ET.tostring(root, encoding="unicode", xml_declaration=True) + "\n"
    write_changed(sitemap, new)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true", help="Inclui rascunhos e mantém noindex")
    args = parser.parse_args()
    all_posts = read_posts()
    published = [p for p in all_posts if p["published"]]
    visible = all_posts if args.preview else published
    slugs = {p["slug"] for p in visible}
    for path in BLOG.glob("*/index.html"):
        if path.parent.name not in slugs:
            path.unlink()
    for post in visible:
        write_changed(BLOG / post["slug"] / "index.html", article_html(post, args.preview))
    cards = "\n".join(card_html(post) for post in visible) or (
        '<p>Estamos preparando novos conteúdos. Volte em breve!</p>'
    )
    listing_robots = "noindex,follow" if args.preview or not published else "index,follow"
    write_changed(BLOG / "index.html", render(INDEX_TPL, {
        "ROBOTS": listing_robots,
        "POST_CARDS": cards
    }))
    if not args.preview:
        update_sitemap(published)
    print("Blog Isabele: %d página(s), %d publicado(s), modo prévia=%s" %
          (len(visible), len(published), args.preview))

if __name__ == "__main__":
    main()

"""Garante que os destaques do blog e da landing acompanham o Pages CMS."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build_blog


def post(slug, featured=False):
    return {
        "slug": slug,
        "title": "Título de teste " + slug,
        "category": "Cuidados",
        "summary": "Resumo de teste",
        "cover": "/assets/blog/" + slug + ".webp",
        "coverAlt": "Foto das unhas",
        "featured": featured,
        "published": True,
    }


class BlogHighlightsTests(unittest.TestCase):
    def test_featured_has_priority_and_order_is_stable(self):
        posts = [post("a"), post("b", featured=True), post("c")]
        self.assertEqual(
            [p["slug"] for p in build_blog.ordered_featured(posts)],
            ["b", "a", "c"],
        )

    def test_legacy_posts_without_featured_keep_working(self):
        a = post("a")
        a.pop("featured")
        b = post("b")
        self.assertEqual(
            [p["slug"] for p in build_blog.ordered_featured([a, b])],
            ["a", "b"],
        )

    def test_latest_article_is_main_and_three_others_are_horizontal(self):
        latest, sidebar, remaining = (
            post("novo", featured=True),
            [post("a", featured=True), post("b", featured=True), post("c", featured=True)],
            [post("extra")],
        )
        html = build_blog.spotlight_section(latest, sidebar)
        self.assertIn('id="spotlight-title"', html)
        self.assertIn('href="/blog/novo/"', html)
        self.assertIn('aria-label="Artigos selecionados em destaque"', html)
        self.assertIn('style="--stack-count:3"', html)
        self.assertEqual(html.count('class="blog-feature-card blog-feature-card--compact"'), 3)
        self.assertEqual(html.count('width="1200" height="900"'), 4)
        self.assertIn('loading="eager"', html)
        self.assertIn('loading="lazy"', html)
        self.assertNotIn('href="/blog/extra/"', html)

    def test_select_spotlight_prioritizes_latest_without_duplication(self):
        posts = [post("velho", True), post("novo", True),
                 post("intermediario", True), post("outro", True),
                 post("extra", True)]
        ranks = {"velho": 100, "intermediario": 120, "outro": 130,
                 "extra": 140, "novo": 200}
        with patch.object(build_blog, "published_timestamp",
                          side_effect=lambda slug: ranks[slug]):
            latest, highlights, remaining = build_blog.select_spotlight(posts)
        self.assertEqual(latest["slug"], "novo")
        self.assertEqual([p["slug"] for p in highlights],
                         ["extra", "outro", "intermediario"])
        self.assertEqual([p["slug"] for p in remaining], ["velho"])
        self.assertNotIn(latest, highlights)

    def test_only_cms_featured_posts_appear_on_right(self):
        posts = [post("a", True), post("b"), post("c", True), post("d")]
        ranks = {"a": 50, "b": 40, "c": 30, "d": 20}
        with patch.object(build_blog, "published_timestamp",
                          side_effect=lambda slug: ranks[slug]):
            latest, highlights, remaining = build_blog.select_spotlight(posts)
        self.assertEqual(latest["slug"], "a")
        self.assertEqual([p["slug"] for p in highlights], ["c"])
        self.assertEqual([p["slug"] for p in remaining], ["b", "d"])

    def test_empty_spotlight_and_one_featured(self):
        self.assertIn("Estamos preparando",
                      build_blog.spotlight_section(None, []))
        html = build_blog.spotlight_section(post("principal"), [post("outro")])
        self.assertIn('style="--stack-count:1"', html)
        self.assertEqual(html.count('class="blog-feature-card blog-feature-card--compact"'), 1)
        self.assertNotIn("blog-feature-grid--single", html)
        self.assertIn("blog-feature-grid--single",
                      build_blog.spotlight_section(post("principal"), []))

    def test_later_edits_do_not_change_publish_timestamp(self):
        # Lista de commits: edição recente, publicação original, rascunho antigo.
        class Result:
            def __init__(self, stdout):
                self.stdout = stdout
        entries = {
            "edit": '{"published": true}',
            "publish": '{"published": true}',
            "draft": '{"published": false}',
        }
        def fake_run(args, **kwargs):
            if args[1] == "log":
                return Result("edit 300\npublish 200\ndraft 100\n")
            return Result(entries[args[2].split(":")[0]])
        build_blog.published_timestamp.cache_clear()
        with patch.object(build_blog.subprocess, "run", side_effect=fake_run):
            self.assertEqual(build_blog.published_timestamp("artigo"), 200)
        build_blog.published_timestamp.cache_clear()

    def test_remaining_articles_render_separately(self):
        html = build_blog.more_section([post("c")])
        self.assertIn('href="/blog/c/"', html)
        self.assertNotIn('/blog/a/', html)
        self.assertEqual(build_blog.more_section([]), "")

    def test_landing_renders_only_given_published_posts(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            index = root / "index.html"
            index.write_text(
                "<main>\n    <!-- BLOG_FEATURED_START -->\n"
                "    placeholder\n    <!-- BLOG_FEATURED_END -->\n</main>",
                encoding="utf-8",
            )
            with patch.object(build_blog, "ROOT", root):
                build_blog.update_landing_featured([post("a"), post("b")])
            html = index.read_text(encoding="utf-8")
            self.assertEqual(html.count('class="home-blog__card"'), 2)
            self.assertIn('home-blog__grid--two', html)
            self.assertIn('href="/blog/a/"', html)
            self.assertIn('href="/blog/b/"', html)
            self.assertNotIn("placeholder", html)
            self.assertIn("BLOG_FEATURED_START", html)
            self.assertIn("BLOG_FEATURED_END", html)

    def test_landing_escapes_editorial_content(self):
        article = post("teste")
        article["title"] = '<img src="bad" onerror="alert(1)">'
        html = build_blog.landing_card_html(article)
        self.assertNotIn('<img src="bad"', html)
        self.assertIn('&lt;img src=&quot;bad&quot;', html)

    def test_no_published_articles_removes_landing_section(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            index = root / "index.html"
            index.write_text(
                '    <!-- BLOG_FEATURED_START -->old content'
                '    <!-- BLOG_FEATURED_END -->',
                encoding="utf-8",
            )
            with patch.object(build_blog, "ROOT", root):
                build_blog.update_landing_featured([])
            html = index.read_text(encoding="utf-8")
            self.assertNotIn('class="home-blog"', html)
            self.assertNotIn("old content", html)


if __name__ == "__main__":
    unittest.main()

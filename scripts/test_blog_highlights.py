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

    def test_spotlight_uses_4_to_3_source_dimensions(self):
        html = build_blog.spotlight_section([post("a"), post("b")])
        self.assertIn('id="spotlight-title"', html)
        self.assertEqual(html.count('width="1200" height="900"'), 2)
        self.assertEqual(html.count('class="blog-feature-card'), 4)
        self.assertIn('loading="eager"', html)
        self.assertIn('loading="lazy"', html)

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

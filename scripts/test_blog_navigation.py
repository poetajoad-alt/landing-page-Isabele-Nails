"""Navegação de retorno consistente nos templates gerados pelo Pages CMS."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class BlogBackNavigationTests(unittest.TestCase):
    def test_blog_principal_tem_voltar_para_site(self):
        template = (ROOT / "templates/blog-index.html.tpl").read_text(encoding="utf-8")
        self.assertIn('class="blog-back-link" href="/">← Voltar ao site</a>', template)

    def test_ver_todos_tem_voltar_para_blog(self):
        template = (ROOT / "templates/blog-all.html.tpl").read_text(encoding="utf-8")
        self.assertIn('class="blog-all__back blog-back-link" href="/blog/">← Voltar ao blog</a>', template)

    def test_gerador_inclui_voltar_em_todos_os_artigos(self):
        source = (ROOT / "scripts/build_blog.py").read_text(encoding="utf-8")
        self.assertIn('class="kicker blog-back-link" href="/blog/">', source)

    def test_ancoras_visiveis_e_acessiveis_no_mobile(self):
        css = (ROOT / "blog/blog.css").read_text(encoding="utf-8")
        self.assertIn('a.blog-back-link{', css)
        self.assertIn('min-height:44px', css)
        self.assertIn('a.blog-back-link:focus-visible', css)


if __name__ == "__main__":
    unittest.main()

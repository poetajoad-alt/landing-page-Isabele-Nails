"""Testes de regressão do editor visual de imagens e legendas do blog."""
import unittest

from build_blog import clean_body


class CaptionTests(unittest.TestCase):
    def test_image_followed_by_caption_with_credit(self):
        source = (
            '<img src="/assets/blog/esmaltes.webp" alt="Esmaltes coloridos">'
            '<p>Variedade de cores. Foto ilustrativa: Sofía Falco / Pexels.</p>'
        )
        rendered = clean_body(source)
        self.assertIn(
            '<figure><img src="/assets/blog/esmaltes.webp" alt="Esmaltes coloridos"'
            ' loading="lazy" decoding="async"><figcaption>'
            'Variedade de cores. Foto ilustrativa: Sofía Falco / Pexels.'
            '</figcaption></figure>', rendered
        )

    def test_image_inside_paragraph(self):
        source = (
            '<p><img src="/assets/blog/foto.jpg" alt="Unhas"></p>'
            '<p>Foto: Isabele Mariana Nails.</p>'
        )
        rendered = clean_body(source)
        self.assertEqual(rendered.count("<figure>"), 1)
        self.assertEqual(rendered.count("<figcaption>"), 1)
        self.assertNotIn("<p><img", rendered)

    def test_normal_paragraph_is_not_caption(self):
        source = (
            '<img src="/assets/blog/foto.jpg" alt="Unhas">'
            '<p>Em condições semelhantes, a esmaltação em gel costuma durar mais.</p>'
        )
        rendered = clean_body(source)
        self.assertNotIn("<figcaption>", rendered)
        self.assertIn("<p>Em condições semelhantes", rendered)

    def test_existing_figcaption_not_nested(self):
        source = (
            '<figure><img src="/assets/blog/foto.jpg" alt="Unhas">'
            '<figcaption>Foto: Isabele Mariana Nails.</figcaption></figure>'
        )
        rendered = clean_body(source)
        self.assertEqual(rendered.count("<figure>"), 1)
        self.assertEqual(rendered.count("<figcaption>"), 1)

    def test_caption_too_long_stays_paragraph(self):
        source = (
            '<img src="/assets/blog/foto.jpg" alt="Unhas">'
            '<p>Foto: ' + 'a' * 300 + '</p>'
        )
        self.assertNotIn("<figcaption>", clean_body(source))

    def test_untrusted_markup_is_sanitized(self):
        source = (
            '<img src="/assets/blog/foto.jpg" onerror="alert(1)" alt="Unhas">'
            '<p>Foto: <script>alert("x")</script> Isabele Nails.</p>'
        )
        rendered = clean_body(source)
        self.assertIn("<figcaption>", rendered)
        self.assertNotIn("onerror=", rendered)
        self.assertNotIn("alert(", rendered)

    def test_explicit_legend_without_credit(self):
        source = (
            '<img src="/assets/blog/foto.jpg" alt="Unhas">'
            '<p>Legenda: unhas em acabamento perolado.</p>'
        )
        self.assertIn("<figcaption>", clean_body(source))


if __name__ == "__main__":
    unittest.main()

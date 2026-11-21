# Blog Isabele Mariana Nails — publicação pelo Pages CMS

## Como editar pelo navegador (sem HTML)

1. Acesse https://app.pagescms.org/ e entre com a conta GitHub **poetajoad-alt**.
2. Instale/autorize o aplicativo Pages CMS para o repositório `poetajoad-alt/landing-page-Isabele-Nails`. Essa autorização é feita manualmente pelo proprietário da conta.
3. Para o teste, escolha a branch `feat/blog-piloto-isabele-20261121`.
4. Abra **Artigos do Blog**. O artigo piloto está salvo como arquivo JSON.
5. Edite título, resumo, SEO, foto e texto completo usando o editor visual.
6. Salve. O Pages CMS cria um commit no GitHub; o GitHub Actions **Blog Isabele - atualizar paginas do CMS** reconstrói o HTML.
7. Enquanto estivermos na branch de teste, as páginas continuam com `noindex`, mesmo se o campo **Aprovado para publicação** estiver ativado.

## Imagens

- O próprio Pages CMS permite enviar fotos e selecioná-las no campo **Imagem de capa**.
- Prefira fotos reais autorizadas dos trabalhos da Isabele, com enquadramento completo, sem corte e idealmente em WebP/JPEG otimizado.
- O CMS armazena os arquivos em `assets/` e escreve no artigo o caminho público `/assets/...`.
- Antes de publicar, preencha o **Texto ALT** (descrição real da foto) e a legenda, se desejada.
- Não é necessário editar HTML nem copiar manualmente o nome da imagem para o código.

Se a foto for enviada ao ChatGPT, ela pode ser preparada e otimizada aqui; depois basta escolher o arquivo final no campo de upload do Pages CMS.

## Publicação em produção

- Por segurança, este blog está em PR de teste. **Não faça merge sem validar texto, imagens e navegação**.
- Depois de aprovado o blog, faça merge do PR na `main` e configure o CMS para usar a branch `main`.
- A partir daí, publique um artigo ativando **Aprovado para publicação** no editor.
- O GitHub Actions gera a página indexável e atualiza `sitemap.xml` automaticamente; um rascunho sem aprovação não é incluído no sitemap.
- Por favor, não altere o campo **Endereço amigável** de um artigo depois de criado: mudar a URL exige tratamento de SEO e possível redirecionamento.

## Desenvolvimento local (opcional)

Na pasta clonada e na branch do blog:

```powershell
git pull origin feat/blog-piloto-isabele-20261121
python scripts/build_blog.py --preview
```

Abra `blog/index.html` com Live Server, ou abra o artigo diretamente:

`blog/como-cuidar-das-unhas-entre-atendimentos/index.html`

O script de geração usa apenas a biblioteca-padrão do Python (3.12) e não acessa serviços externos.

## Arquivos principais

- `.pages.yml`: configuração visual do Pages CMS.
- `content/blog/posts/*.json`: artigos editáveis.
- `templates/blog-article.html.tpl` e `templates/blog-index.html.tpl`: layout fixo.
- `scripts/build_blog.py`: gerador de HTML e sitemap.
- `.github/workflows/blog-build.yml`: automação da publicação.
- `blog/blog.css`: estilo visual, independente da landing.

# Catálogo de serviços e valores — Isabele Mariana Nails

Página pública: https://isabelemariananails.com.br/catalogo/

## Fonte de dados

A página consulta diretamente as coleções públicas do projeto Firebase do aplicativo oficial:
- `categorias`: nome, descrição, slug, `ativo` / status
- `servicos`: nome, descrição, preço, duração, categoriaId/categoria, `ativo` / status

Usa Firebase JS SDK v12.14.0, com a mesma configuração **pública** do aplicativo, em `catalogo/firebase-public-config.js`. A configuração NÃO contém credenciais de administração, webhook nem tokens secretos. Nunca inserir credenciais de service account no navegador.

O catálogo só exibe categorias e serviços ativos, com os mesmos critérios de associação e aliases legados do aplicativo. Dados de clientes, agendamentos e PIX não são consultados.

Preços não são cadastrados na home. Eles são lidos do Firestore quando a página abre, refletindo novas alterações após atualização da página. Se Firestore falhar, não aparecem preços inventados; há uma tela de erro e um link direto ao app.

O botão **Agendar este serviço** leva para `https://isabelenailsapp.vercel.app/agendamento.html?id=<docId>`, mesma rota usada pela tela de categorias do aplicativo. O app faz sua própria verificação de serviço, disponibilidade e regras de sinal PIX.

## UX
- Hero editorial com fotografia real da pasta de assets
- Cards com nome, descrição, duração, preço e CTA
- Navegação por categorias e busca sem acentos
- Identidade rosa/chá, tipografia Playfair Display + DM Sans
- Agendamento fixo no topo do celular, menu hambúrguer e navegação inferior
- Seções Sobre e Blog conectadas à experiência
- SEO local, canonical e inclusão no sitemap
- Analytics GA4: carregamento, categorias e cliques de agendamento

## Verificação
`node --check catalogo/catalogo.js`
`node --test scripts/test_catalogo.mjs`

O workflow `Catálogo de serviços - validação` executa os testes a cada alteração na página.

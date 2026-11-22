
# Home editorial — Isabele Mariana Nails (22/11/2026)

A página principal agora segue: Hero → Portfólio → Serviços com artigos → Sobre → Diferenciais → Avaliações → Agendamento → Blog → Contato.

## Portfólio
As fotos são copiadas dos blobs originais em assets/blog para assets/portfolio sem reprocessar ou inventar imagens:
- vinho-brilhante.webp: foto real identificada no artigo de banho de gel;
- cuidados-unhas.webp: capa do artigo de cuidados;
- esmaltacao-gel.webp: capa do artigo de esmaltação.

A galeria funciona sem Instagram incorporado: editorial em desktop, scroll-snap horizontal e setas no mobile, ampliação com foco e fechamento por Esc. Substituir/expandir os assets com novas fotografias autorizadas quando enviadas pela profissional. Atualizar alt, caption e número de slides ao adicionar fotos.

## Avaliações do Google Maps
A seção sempre mostra um CTA funcional para avaliar no Google: https://g.page/r/CVxYoLzta8eSECE/review.

Integração dinâmica: /api/google-reviews (Vercel). Para ativar, configurar no painel da hospedagem:
- GOOGLE_PLACES_API_KEY: chave da Places API (New), **secreta e somente no servidor**;
- GOOGLE_PLACE_ID: ID real da ficha Google da profissional (obter no Google Places/Maps).

Ativar faturamento da API e restrições adequadas da chave no Google Cloud. Depois de configurar, fazer deploy para ativar as variáveis. Confirmar cobrança e regras de atribuição/uso do Google. A API utiliza o endpoint Place Details (New), campos rating,userRatingCount,reviews,googleMapsUri, sem armazenar respostas e no máximo três depoimentos retornados; o Google pode fornecer até cinco. A UI mostra créditos 'Google Maps', autores e links individuais quando fornecidos. Não fazer scraping, editar textos, inventar notas ou incluir AggregateRating manual no schema.org.

Se o site for servido apenas por hospedagem estática e não pelo Vercel, /api/google-reviews não será executada; o botão de avaliação continua visível e a seção dinâmica fica oculta até adicionar backend compatível.

Fontes: https://developers.google.com/maps/documentation/places/web-service/place-details e https://developers.google.com/maps/documentation/places/web-service/policies

## Testes recomendados
- Home em 360px, 390px, tablet e desktop; menu e âncoras
- Deslize horizontal + setas da galeria, abrir/fechar foto, tecla Escape
- Links para artigos publicados e botão de agendamento funcionando
- Respostas 503 / 200 / 502 da API sem apresentar dados falsos
- PageSpeed e Search Console após publicação

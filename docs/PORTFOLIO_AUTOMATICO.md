# Portfólio automático — sem Liquid

A home apresenta uma galeria única, sem categorias nem títulos sobrepostos. Aceita imagens WebP, JPG, JPEG e PNG (incluindo extensões maiúsculas).

## Como adicionar fotografias

1. Salve novas imagens em `assets/portfolio/`, por exemplo `alongamento-rosa-francesinha.jpg`.
2. Faça `git add assets/portfolio/`, commit e push para a branch `main`.
3. Após publicar no GitHub Pages, as novas fotos aparecem automaticamente, sem editar HTML/JS.

## Funcionamento

- As fotos inicialmente presentes no HTML são um fallback caso a conexão externa falhe.
- O JavaScript consulta a pasta pública do GitHub via Contents API para encontrar novos arquivos.
- Como alternativa à API, consulta `assets/portfolio/manifest.json`.
- O GitHub Actions gera o manifesto quando recebe um push com alterações nas fotos.
- O primeiro item por ordem alfabética é o destaque no desktop. As demais fotos seguem no mosaico e no carrossel.
- O contador e os textos ALT são montados automaticamente a partir dos nomes de arquivo.
- Para remover uma foto, exclua-a do GitHub e publique. O navegador detectará a alteração no próximo acesso.

A API do GitHub pode limitar consultas públicas; por isso existem os fallbacks JSON e HTML. Os arquivos só aparecem depois do `git push`, nunca apenas por salvá-los localmente.

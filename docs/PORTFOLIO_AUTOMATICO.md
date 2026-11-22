# Portfólio com cadastro automático de fotografias

O portfólio é uma galeria única, sem categorias nem títulos sobrepostos.

## Como adicionar novas imagens

1. Salve as imagens na pasta `assets/portfolio/` deste repositório.
2. Os formatos aceitos são `.webp`, `.jpg`, `.jpeg` e `.png` (maiúsculas/minúsculas também funcionam).
3. Envie os arquivos ao GitHub (`git add assets/portfolio && git commit -m "Adiciona fotos ao portfólio" && git push origin main`).
4. Aguarde a publicação do GitHub Pages. A página inicial será reconstruída pelo Jekyll, que descobre automaticamente os arquivos da pasta.

**Não é necessário alterar `index.html` nem atualizar o número de fotos.**

## Como o código funciona

O arquivo `index.html` tem *front matter* YAML para que seja processado pelo Jekyll nativo do GitHub Pages. A variável `site.static_files` enumera os arquivos em `assets/portfolio/` e filtra as quatro extensões. A primeira foto em ordem alfabética fica em destaque no desktop. As demais entram automaticamente no mosaico e no carrossel do celular. O contador mostra o número real de fotos. Cada foto pode ser aberta em tela ampliada.

Os textos ALT e as legendas da ampliação são gerados automaticamente a partir do nome do arquivo (hífens e underscores viram espaços). Prefira nomes descritivos e sem acentos, como `alongamento-unhas-vinho.webp`. Não há texto sobreposto às fotos. Para ALT mais específico, podemos implementar metadados opcionais no futuro.

Arquivos que não forem imagens válidas para a galeria não são exibidos. Para retirar uma fotografia, basta removê-la do repositório e enviar a alteração.

## Observações

- A descoberta só acontece **após o push e o build**, não apenas ao colocar um arquivo no VS Code.
- Não é necessário criar um workflow adicional, API ou conexão do navegador ao GitHub.
- GitHub Pages precisa continuar usando o build Jekyll (padrão de publicações por branch, sem arquivo `.nojekyll`).
- Otimize as fotos para bom desempenho, especialmente no celular, sem substituir os arquivos originais sem autorização.

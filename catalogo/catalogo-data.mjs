/* Regras de catálogo alinhadas ao aplicativo da Isabele: src categoriasCatalogo.mjs. */
/* Módulo puro: não acessa Firebase, DOM ou dados de clientes. */
export function slug(value) {
  return String(value || "").trim().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}
export function categoriaAtiva(cat) {
  return !!cat && cat.ativo !== false &&
    !["inativo", "inactive", "desativado", "disabled"].includes(String(cat.status || "ativo").toLowerCase());
}
export function servicoAtivo(svc) {
  return !!svc && svc.ativo !== false &&
    !["inativo", "desativado", "disabled"].includes(String(svc.status || "").toLowerCase());
}
export function pertenceCategoria(svc, cat) {
  if (!svc || !cat) return false;
  if (svc.categoriaId && svc.categoriaId === cat.id) return true;
  const fromService = slug(svc.categoria || svc.categoriaSlug || svc.tipo);
  const fromCategory = slug(cat.slug || cat.nome);
  const aliases = Array.isArray(cat.legacySlugs) ? cat.legacySlugs.map(slug) : [];
  return Boolean(fromService && (fromService === fromCategory || aliases.includes(fromService)));
}
export function montarCatalogo(categorias = [], servicos = []) {
  const cats = categorias.map(c => ({...c}));
  const legadas = [
    { slug: "unhas-em-gel", nome: "Unhas em Gel" },
    { slug: "manicure", nome: "Manicure" },
    { slug: "pedicure", nome: "Pedicure" },
  ];
  for (const legacy of legadas) {
    const exists = cats.some(c => slug(c.slug || c.nome) === legacy.slug ||
      (Array.isArray(c.legacySlugs) && c.legacySlugs.map(slug).includes(legacy.slug)));
    if (!exists) cats.push({id:"legacy_" + legacy.slug, ...legacy, ativo:true, legacySlugs:[legacy.slug]});
  }
  return cats.filter(categoriaAtiva).map(cat => ({
    ...cat,
    servicos: servicos.filter(s => servicoAtivo(s) && pertenceCategoria(s,cat))
      .sort((a,b)=>String(a.nome||"").localeCompare(String(b.nome||""),"pt-BR"))
  })).filter(cat => cat.servicos.length > 0)
    .sort((a,b)=>String(a.nome||"").localeCompare(String(b.nome||""),"pt-BR"));
}
export function normalizarBusca(value) {
  return String(value || "").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g," ").trim();
}
export function filtrarCatalogo(catalogo = [], categoriaId = "todas", termo = "") {
  const text = normalizarBusca(termo);
  return catalogo.filter(c => categoriaId === "todas" || c.id === categoriaId)
    .map(c => ({...c, servicos:c.servicos.filter(s => {
      if (!text) return true;
      const searchable = normalizarBusca([s.nome,s.descricao,c.nome,c.descricao].join(" "));
      return text.split(" ").every(word => searchable.includes(word));
    })})).filter(c => c.servicos.length > 0);
}
export function parsePreco(value) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  if (value === null || value === undefined) return null;
  let input = String(value).replace(/[^0-9.,-]/g,"").trim();
  if (!input) return null;
  if (input.includes(",")) input = input.replace(/\./g,"").replace(",",".");
  const n = Number(input);
  return Number.isFinite(n) && n > 0 ? n : null;
}
export function precoBRL(value) {
  const n = parsePreco(value);
  return n === null ? "Valor a consultar" :
    new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
}
export function duracaoLabel(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) + " min" : "Duração a confirmar";
}
export function urlAgendamento(id) {
  return "https://isabelenailsapp.vercel.app/login.html?servico=" + encodeURIComponent(String(id));
}

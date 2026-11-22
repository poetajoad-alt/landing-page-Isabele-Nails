/* Catálogo público integrado às coleções de serviços e categorias do app oficial. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-public-config.js";
import { montarCatalogo, filtrarCatalogo, precoBRL, parsePreco, duracaoLabel, urlAgendamento } from "./catalogo-data.mjs";

const app = initializeApp(firebaseConfig, "catalogo-site-isabele");
const db = getFirestore(app);
const $ = selector => document.querySelector(selector);
const list = $("#catalog-list");
const categories = $("#catalog-categories");
const status = $("#catalog-result-count");
const loading = $("#catalog-loading");
const error = $("#catalog-error");
const empty = $("#catalog-empty");
const emptyMessage = $("#catalog-empty-message");
const indicator = $("#catalog-data-indicator");
const search = $("#catalog-search");
const retry = $("#catalog-retry");
const clear = $("#catalog-clear");
let allGroups = [];
let selectedCategory = "todas";
let searchText = "";
let inFlight = false;
const formatCount = n => n + " " + (n === 1 ? "serviço disponível" : "serviços disponíveis");
function track(name, parameters = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, {...parameters, origem:"catalogo_site"});
}
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = String(text);
  return el;
}
function hideStates() {
  loading.hidden = true; error.hidden = true; empty.hidden = true;
}
function card(service, index) {
  const article = node("article","catalog-card");
  const topline = node("div","catalog-card-topline");
  topline.append(node("span","catalog-card-index",String(index+1).padStart(2,"0") + " / SERVIÇO"));
  const maintenance = /manuten[cç][aã]o/i.test(String(service.nome||""));
  if (maintenance) topline.append(node("span","catalog-maintenance","Manutenção"));
  article.append(topline);
  article.append(node("h4","",service.nome||"Serviço de unhas"));
  article.append(node("p","catalog-card-description",service.descricao||"Consulte mais detalhes sobre este procedimento ao agendar."));
  const info = node("div","catalog-card-meta");
  const time = node("span","catalog-time");
  time.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  time.append(document.createTextNode(duracaoLabel(service.duracao)));
  const price = node("div","catalog-price"+(parsePreco(service.preco)===null?" is-consult":""));
  price.append(node("small","","Valor do procedimento"));
  price.append(node("strong","",precoBRL(service.preco)));
  info.append(time,price);
  article.append(info);
  const a = node("a","catalog-card-link");
  a.href=urlAgendamento(service.id);
  a.target="_blank"; a.rel="noopener noreferrer";
  a.setAttribute("aria-label","Agendar "+String(service.nome||"serviço")+" no aplicativo da Isabele");
  a.append(node("span","","Agendar este serviço"),node("span","","↗"));
  a.addEventListener("click",()=>track("catalogo_servico_agendar",{servico_id:service.id,categoria:service.categoria||service.categoriaId||""}));
  article.append(a);
  return article;
}
function render() {
  if (!allGroups.length) return;
  const groups=filtrarCatalogo(allGroups,selectedCategory,searchText);
  list.replaceChildren();
  let count=0;
  const fragment=document.createDocumentFragment();
  for(const group of groups){
    const section=node("section","catalog-group");
    const heading=node("div","catalog-group-heading");
    const header=node("div","");
    header.append(node("h3","",group.nome||"Serviços"));
    if(group.descricao) header.append(node("p","",group.descricao));
    heading.append(header,node("span","catalog-group-count",group.servicos.length+(group.servicos.length===1?" opção":" opções")));
    section.append(heading);
    const grid=node("div","catalog-cards");
    group.servicos.forEach((service,index)=>{grid.append(card(service,index)); count+=1;});
    section.append(grid);
    fragment.append(section);
  }
  list.append(fragment);
  list.setAttribute("aria-busy","false");
  hideStates();
  empty.hidden = count !== 0;
  if (!count) emptyMessage.textContent = "Experimente outro termo ou selecione outra categoria.";
  status.textContent = formatCount(count);
}
function renderCategories() {
  categories.replaceChildren();
  const allButton=node("button","catalog-chip","Todos os serviços");
  allButton.type="button";
  allButton.dataset.category="todas";
  allButton.setAttribute("aria-pressed",String(selectedCategory==="todas"));
  if(selectedCategory==="todas") allButton.classList.add("is-active");
  categories.append(allButton);
  for (const cat of allGroups) {
    const button=node("button","catalog-chip",cat.nome);
    button.type="button";
    button.dataset.category=cat.id;
    button.setAttribute("aria-pressed",String(cat.id===selectedCategory));
    if(cat.id===selectedCategory) button.classList.add("is-active");
    categories.append(button);
  }
}
async function load() {
  if (inFlight) return;
  inFlight=true;
  loading.hidden=false;error.hidden=true;empty.hidden=true;indicator.hidden=true;
  list.replaceChildren();list.setAttribute("aria-busy","true");
  status.textContent="Consultando serviços...";
  try{
    const [cats,svcs] = await Promise.all([
      getDocs(collection(db,"categorias")),
      getDocs(collection(db,"servicos"))
    ]);
    const rawCats=cats.docs.map(d=>({id:d.id,...d.data()}));
    const rawSvcs=svcs.docs.map(d=>({id:d.id,...d.data()}));
    allGroups=montarCatalogo(rawCats,rawSvcs);
    selectedCategory="todas";
    indicator.hidden=false;
    renderCategories();
    if(!allGroups.length){
      hideStates();
      list.setAttribute("aria-busy","false");
      empty.hidden=false;
      emptyMessage.textContent="Não há procedimentos ativos disponíveis no momento. Consulte o aplicativo para verificar a agenda.";
      status.textContent="Nenhum serviço ativo no momento";
    }else{
      render();
      track("catalogo_carregado",{categorias:allGroups.length,servicos:allGroups.reduce((sum,c)=>sum+c.servicos.length,0)});
    }
  }catch(err){
    console.error("Falha ao consultar catálogo da Isabele:",err);
    allGroups=[];
    indicator.hidden=true;
    list.setAttribute("aria-busy","false");
    status.textContent="Serviços temporariamente indisponíveis";
    loading.hidden=true;error.hidden=false;
  }finally{inFlight=false;}
}
categories.addEventListener("click",event=>{
  const button=event.target.closest("[data-category]");
  if(!button||!categories.contains(button))return;
  selectedCategory=button.dataset.category;
  for(const child of categories.querySelectorAll("[data-category]")){
    const active=child.dataset.category===selectedCategory;
    child.classList.toggle("is-active",active);
    child.setAttribute("aria-pressed",String(active));
  }
  render();
  track("catalogo_filtro_categoria",{categoria:selectedCategory});
});
search.addEventListener("input",()=>{
  searchText=search.value.trim();
  if(allGroups.length)render();
});
retry.addEventListener("click",load);
clear.addEventListener("click",()=>{
  search.value="";searchText="";selectedCategory="todas";
  renderCategories();
  render();
  search.focus();
});
for(const a of document.querySelectorAll("[data-booking]")){
  a.addEventListener("click",()=>track("catalogo_agendamento_click",{posicao:a.dataset.booking}));
}
const toggle=$("#mobile-menu-toggle");
const menu=$("#mobile-menu");
function closeMenu(){
  toggle.classList.remove("is-open"); menu.classList.remove("is-open");
  toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","Abrir menu");
}
toggle.addEventListener("click",event=>{
  event.stopPropagation();
  const opened=menu.classList.toggle("is-open");
  toggle.classList.toggle("is-open",opened);
  toggle.setAttribute("aria-expanded",String(opened));
  toggle.setAttribute("aria-label",opened?"Fechar menu":"Abrir menu");
});
menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("click",event=>{
  if(!menu.contains(event.target)&&!toggle.contains(event.target))closeMenu();
});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu();});
window.addEventListener("resize",()=>{if(window.innerWidth>900)closeMenu();});
const year=$("#catalog-year");
if(year)year.textContent=String(new Date().getFullYear());
load();

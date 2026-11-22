import test from "node:test";
import assert from "node:assert/strict";
import {
  montarCatalogo,filtrarCatalogo,precoBRL,parsePreco,duracaoLabel,urlAgendamento,
  categoriaAtiva,servicoAtivo
} from "../catalogo/catalogo-data.mjs";

const cats=[
  {id:"cat_gel",nome:"Unhas em Gel",slug:"unhas-em-gel",ativo:true},
  {id:"cat_disabled",nome:"Sem serviços",slug:"sem-servicos",ativo:false}
];
const services=[
  {id:"A 12",nome:"Alongamento",descricao:"Especialista em Guarulhos",categoriaId:"cat_gel",preco:195,duracao:120,ativo:true},
  {id:"b",nome:"Manutenção",categoria:"unhas-em-gel",preco:95.5,duracao:90,status:"ativo"},
  {id:"c",nome:"Procedimento antigo",categoriaId:"cat_gel",preco:500,ativo:false},
  {id:"d",nome:"Inativo em categoria",categoria:"sem-servicos",preco:500,ativo:true},
];
test("catálogo considera serviços ativos, categorias ativas e legado",()=>{
  const result=montarCatalogo(cats,services);
  assert.equal(result.length,1);
  assert.deepEqual(result[0].servicos.map(s=>s.id),["A 12","b"]);
  assert.equal(categoriaAtiva(cats[1]),false);
  assert.equal(servicoAtivo(services[2]),false);
});
test("busca ignora acentos e respeita categoria",()=>{
  const grouped=montarCatalogo(cats,services);
  assert.equal(filtrarCatalogo(grouped,"todas","GUARULHOS")[0].servicos[0].nome,"Alongamento");
  assert.equal(filtrarCatalogo(grouped,"cat_gel","manutencao")[0].servicos[0].nome,"Manutenção");
  assert.equal(filtrarCatalogo(grouped,"cat_disabled").length,0);
});
test("preços e durações reais, com ausentes sem inventar",()=>{
  assert.equal(precoBRL(195),"R$ 195,00");
  assert.equal(precoBRL("1.230,50"),"R$ 1.230,50");
  assert.equal(precoBRL(0),"Valor a consultar");
  assert.equal(parsePreco(null),null);
  assert.equal(duracaoLabel(90),"90 min");
  assert.equal(duracaoLabel(null),"Duração a confirmar");
});
test("botão encaminha ao login com o serviço preservado",()=>{
  assert.equal(urlAgendamento("A 12"),"https://isabelenailsapp.vercel.app/login.html?servico=A%2012");
});

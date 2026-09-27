# Blog Adeconex Hub

🚀 PROMPT – BLOG ADECONEX (SEO + DOWNLOAD + HUB TÉCNICO)

CONTEXTO

Criar um novo site no domínio www.adeconex.com que substituirá o conteúdo atual e funcionará como:

 Blog técnico de alto volume SEO

 Central de downloads (drivers e softwares)

 Hub de conhecimento sobre impressoras térmicas, etiquetas e ribbons

 Canal de conversão para o site principal: www.adeconex.com.br

O site deve ser altamente otimizado para SEO e organizado em silos técnicos.

OBJETIVO

Construir uma plataforma com:

 Estrutura SEO em silos

 Sistema de páginas dinâmicas para drivers

 Central de downloads filtrável

 Conteúdo técnico com alto ranqueamento

 Integração com links para conversão

 Base pronta para futura IA (robô de busca)

ESTRUTURA DE ROTAS

Criar as seguintes rotas principais:

 /

 /impressoras

 /drivers

 /softwares

 /tutoriais

 /materiais

 /downloads

 /blog

Rotas dinâmicas:

 /impressoras/[marca]

 /impressoras/[marca]/[modelo]

 /drivers/[modelo]

 /softwares/[nome]

 /tutoriais/[slug]

SILOS SEO (OBRIGATÓRIO)

SILO 1 – Impressoras

 Página por marca

 Página por modelo

SILO 2 – Drivers (PRIORIDADE MÁXIMA)

Cada página deve conter:

 Título SEO forte

 Botão de download

 Versões do driver

 Compatibilidade (Windows etc)

 Tutorial de instalação

 Problemas comuns

 Links internos

SILO 3 – Tutoriais

Conteúdo longo e detalhado

SILO 4 – Softwares

Ex:

 BarTender

 Zebra Setup Utilities

SILO 5 – Materiais

Foco em conversão:

 Etiquetas

 Ribbon

 Fita de cetim

BANCO DE DADOS (SEM LIMITE DE REGISTROS)

Criar as tabelas:

drivers

 id

 marca

 modelo

 nome

 versao

 sistema_operacional

 link_download

 data_publicacao

 ativo

printers

 id

 marca

 modelo

 descricao

 imagem_url

softwares

 id

 nome

 descricao

 link_download

 versao

tutorials

 id

 titulo

 slug

 conteudo

 categoria

 created_at

materials

 id

 nome

 categoria

 descricao

 link_produto

CENTRAL DE DOWNLOADS

Criar página /downloads com:

 Filtro por marca

 Filtro por modelo

 Filtro por tipo (driver / software)

 Listagem dinâmica

TEMPLATE DE PÁGINA DE DRIVER

Toda página /drivers/[modelo] deve conter:

 Título otimizado SEO

 Botão de download destacado

 Lista de versões disponíveis

 Tutorial passo a passo

 Seção “problemas comuns”

 Seção “produtos recomendados”

 Links internos para outros modelos

REGRAS DE SEO

 Links internos → follow

 Links para venda → misto:

 Botão principal → follow

 Secundários → nofollow

 Estrutura em silos obrigatória

 URLs amigáveis

 Uso de headings (H1, H2, H3)

DESIGN (BASE ADECONEX)

Seguir identidade de:
www.adeconex.com.br

 Azul (principal)

 Amarelo (destaque)

 Branco (fundo)

 Preto (texto)

Estilo:

 Layout limpo

 Cards organizados

 Botões fortes

 Visual técnico

COMPONENTES

Criar:

 Header fixo com menu

 Footer com links institucionais

 Card de download

 Card de impressora

 Card de tutorial

 Sidebar com links relacionados

 Banner de conversão

INTEGRAÇÃO DE CONVERSÃO

Inserir em páginas:

 Botão “Comprar produto”

 Links para Adeconex.com.br

 Produtos relacionados por contexto

FUTURO (PREPARAR ESTRUTURA)

Preparar base para:

 Robô de busca (IA)

 Busca por modelo de impressora

 Sugestão automática de drivers

REGRAS IMPORTANTES

 NÃO limitar registros no banco

 NÃO limitar consultas

 Estrutura escalável obrigatória

 Código organizado por módulos

 SEO deve ser prioridade

LOGS (OBRIGATÓRIO)

Criar logs para:

 downloads realizados

 páginas acessadas

 buscas realizadas

Tabela:

download_logs

 id

 driver_id

 user_ip

 created_at

CRITÉRIOS DE ACEITE

 Navegação fluida entre silos

 Página de driver completa e funcional

 Filtros da central funcionando

 SEO estruturado corretamente

 Layout responsivo

 Links funcionando

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://driver-silo-bot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/125db48f-304d-4791-9e2d-40d7dc8c3d20).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

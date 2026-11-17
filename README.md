![NexStoque logo](frontend/sources/titlepng.png)

Sistema de gestão de estoque de roupas, desenvolvido como projeto fictício em grupo para o TCC do Forja.

## Sobre o projeto

O objetivo do NexStock é oferecer uma aplicação para organizar e acompanhar o estoque de uma loja de roupas. O repositório está em desenvolvimento: o frontend ainda contém a página inicial padrão do Next.js, e o backend ainda não possui rotas ou uma configuração para iniciar o servidor.

## Tecnologias

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS.
- **Backend:** Node.js, Express e TypeScript.
- **Bibliotecas do backend:** CORS e dotenv.

## Requisitos

- Node.js e npm.

## Instalação e execução

Instale as dependências de cada aplicação em seu próprio diretório:

```bash
cd frontend
npm ci
```

```bash
cd BackEnd
npm ci
```

Para iniciar o frontend em modo de desenvolvimento:

```bash
cd frontend
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

O backend ainda não possui um script de inicialização (`start` ou `dev`). Por isso, embora suas dependências estejam instaladas, a API ainda não pode ser iniciada por um comando npm.

## Estrutura do repositório

```text
NexStock/
├── BackEnd/   # API Express (em configuração)
└── frontend/  # Aplicação Next.js
```

## Scripts disponíveis

No diretório `frontend`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão de produção. |
| `npm run start` | Inicia a versão de produção após o build. |
| `npm run lint` | Executa o ESLint. |

No diretório `BackEnd`, o script de teste ainda é apenas um placeholder; testes e scripts para executar a API serão configurados junto com a implementação do backend.

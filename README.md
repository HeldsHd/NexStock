![NexStoque logo](frontend/sources/titlepng.png)

Sistema de gestão de estoque de roupas, desenvolvido como projeto fictício em grupo para o TCC do Forja.

## Sobre o projeto

O objetivo do NexStock é oferecer uma aplicação para organizar e acompanhar o estoque de uma loja de roupas. O login responsivo fica na rota `/`, em `frontend/app/page.tsx`, e a visão geral do estoque na rota `/home`, em `frontend/app/home/page.tsx`. As variáveis visuais ficam em `frontend/styles/tokens.css` e os componentes reutilizáveis em `frontend/components`. A autenticação ainda aguarda integração com a API; os indicadores do estoque usam dados de demonstração. O backend possui um servidor Express com uma rota inicial para verificar seu funcionamento.

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

Para iniciar o backend em modo de desenvolvimento, abra outro terminal:

```bash
cd BackEnd
npm run migrate
npm run dev
```

Configure `DATABASE_URL` e `SESSION_SECRET` no arquivo `BackEnd/.env` antes de executar a migração. Ela cria a tabela de categorias, adiciona a categoria aos produtos e importa as categorias já existentes. Acesse [http://localhost:3001](http://localhost:3001). A rota `GET /` responde:

```json
{ "mensagem": "Servidor NexStock funcionando!" }
```

O servidor reinicia automaticamente quando o código é alterado. Para mudar a porta, copie `BackEnd/.env.example` para `BackEnd/.env` e ajuste `PORT`. Sem esse arquivo, a porta padrão é 3001.

Para gerar e executar o JavaScript compilado, no diretório `BackEnd`:

```bash
npm run build
npm start
```

## Estrutura do repositório

```text
NexStock/
├── BackEnd/   # API Express
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

No diretório `BackEnd`:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Executa o TypeScript e reinicia o servidor ao alterar o código. |
| `npm run migrate` | Aplica a migração do catálogo de categorias no PostgreSQL. |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos. |
| `npm run build` | Compila o TypeScript para a pasta `dist/`. |
| `npm start` | Executa `dist/app.js` após o build. |

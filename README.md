# dia02-imersao-dev

## Roteiro de Desenvolvimento do Backend (Node.js + SQLite)

Este roteiro descreve os passos para configurar e desenvolver o backend da aplicação, utilizando Node.js, Fastify e SQLite.

### 1. Inicialização do Projeto

1.  **Crie a pasta do backend:**
    Se ainda não existir, crie uma pasta chamada `backend` na raiz do projeto.
2.  **Navegue até a pasta `backend` pelo terminal.**
3.  **Inicie um projeto Node.js:**
    ```bash
    npm init -y
    ```
    Este comando cria um arquivo `package.json` com as configurações padrão.

### 2. Instalação de Dependências

1.  **Instale o Fastify:**
    Framework web para criar as rotas da API.
    ```bash
    npm install fastify
    ```
2.  **Instale o SQLite3:**
    Driver para interagir com o banco de dados SQLite.
    ```bash
    npm install sqlite3
    ```
3.  **Instale o @fastify/cors:**
    Plugin do Fastify para habilitar CORS (Cross-Origin Resource Sharing), permitindo que o frontend acesse a API.
    ```bash
    npm install @fastify/cors
    ```

### 3. Estrutura de Pastas e Arquivos do Backend

Crie a seguinte estrutura de pastas e arquivos dentro da pasta `backend`:

```
backend/
├── package.json
├── database.db  (será criado automaticamente)
└── src/
    ├── database/
    │   ├── db.js
    │   └── migrations/
    │       └── create-table.js
    └── http/
        ├── app.js
        ├── server.js
        └── routes/
            ├── app-routes.js
            └── controllers/
                ├── create-task.js
                ├── get-tasks.js
                ├── update-task.js
                └── delete-task.js
```

-   **`src/database/db.js`**: Configuração da conexão com o banco de dados SQLite.
-   **`src/database/migrations/create-table.js`**: Script para criar a tabela de tarefas (`tasks`) no banco de dados.
-   **`src/http/app.js`**: Configuração da instância do Fastify, incluindo plugins como CORS e registro de rotas.
-   **`src/http/server.js`**: Ponto de entrada da aplicação, responsável por iniciar o servidor Fastify e importar as configurações do banco de dados e migrações.
-   **`src/http/routes/app-routes.js`**: Define todas as rotas da API.
-   **`src/http/routes/controllers/`**: Contém os arquivos com a lógica de cada rota (criar, listar, atualizar, deletar tarefas).

### 4. Configuração do `package.json`

Modifique o arquivo `package.json` para habilitar o uso de módulos ES (`import`/`export`) e definir um script para rodar o servidor em modo de desenvolvimento com watch:

```json
{
  "name": "backend", // ou o nome que preferir
  "version": "1.0.0",
  "main": "index.js", // pode manter ou remover se não for usar
  "type": "module", // Adicione esta linha
  "scripts": {
    "dev": "node --watch ./src/http/server.js" // Modifique/adicione esta linha
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@fastify/cors": "^11.0.1", // Verifique a versão instalada
    "fastify": "^5.3.3",      // Verifique a versão instalada
    "sqlite3": "^5.1.7"       // Verifique a versão instalada
  }
}
```

### 5. Implementação do Código

**5.1. Configuração do Banco de Dados (`src/database/db.js`)**

```javascript
// filepath: backend/src/database/db.js
import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('database.db');
```

**5.2. Criação da Tabela (`src/database/migrations/create-table.js`)**

```javascript
// filepath: backend/src/database/migrations/create-table.js
import { db } from '../db.js';

export function createTable() {
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

createTable(); // Executa a função para garantir que a tabela seja criada
```

**5.3. Configuração do Aplicativo Fastify (`src/http/app.js`)**

```javascript
// filepath: backend/src/http/app.js
import fastify from "fastify";
import { appRoutes } from "./routes/app-routes.js";

export const app = fastify();

app.register(import("@fastify/cors"), {
  origin: [
    "http://localhost:5173", // Endereço do seu frontend
    "http://127.0.0.1:5173", // Endereço do seu frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(appRoutes);
```

**5.4. Servidor (`src/http/server.js`)**

```javascript
// filepath: backend/src/http/server.js
import { app } from "./app.js";
import "../database/db.js"; // Importa para inicializar a conexão
import "../database/migrations/create-table.js"; // Importa para criar a tabela

app
  .listen({
    port: 3333,
  })
  .then(() => console.log("Servidor rodando em http://localhost:3333"));
```

**5.5. Controladores de Tarefas (`src/http/routes/controllers/`)**

*   **`create-task.js`**:
    ```javascript
    // filepath: backend/src/http/routes/controllers/create-task.js
    import { db } from "../../../database/db.js";

    export async function createTask(request, reply) {
      const { title, description, completed = false } = request.body;

      if (!title?.trim()) {
        return reply
          .status(400)
          .send({ message: "O título da tarefa é obrigatório" });
      }

      try {
        const result = await new Promise((resolve, reject) => {
          db.run(
            \`INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)\`,
            [title.trim(), description || "", completed ? 1 : 0],
            function (error) {
              if (error) reject(error);
              else {
                db.get(
                  \`SELECT * FROM tasks WHERE id = ?\`,
                  [this.lastID],
                  (err, row) => {
                    if (err) reject(err);
                    else resolve({ ...row, completed: Boolean(row.completed) });
                  }
                );
              }
            }
          );
        });
        return reply.status(201).send(result);
      } catch (error) {
        return reply.status(500).send({
          message: "Ocorreu um erro ao criar a tarefa: " + error.message,
        });
      }
    }
    ```

*   **`get-tasks.js`**:
    ```javascript
    // filepath: backend/src/http/routes/controllers/get-tasks.js
    import { db } from "../../../database/db.js";

    export async function getTasks(request, reply) {
      try {
        const tasks = await new Promise((resolve, reject) => {
          db.all(\`SELECT * FROM tasks ORDER BY created_at DESC\`, (error, rows) => {
            if (error) reject(error);
            else resolve(rows.map((task) => ({ ...task, completed: Boolean(task.completed) })));
          });
        });
        return tasks;
      } catch (error) {
        return reply.status(500).send({
          message: "Ocorreu um erro ao buscar as tarefas: " + error.message,
        });
      }
    }
    ```

*   **`update-task.js`**:
    ```javascript
    // filepath: backend/src/http/routes/controllers/update-task.js
    import { db } from "../../../database/db.js";

    export async function updateTask(request, reply) {
      const { id } = request.params;
      const { title, description, completed } = request.body;

      if (!title?.trim()) {
        return reply
          .status(400)
          .send({ message: "O título da tarefa é obrigatório" });
      }

      try {
        const result = await new Promise((resolve, reject) => {
          db.run(
            \`UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?\`,
            [title.trim(), description || "", completed ? 1 : 0, id],
            function (error) {
              if (error) reject(error);
              else {
                db.get(\`SELECT * FROM tasks WHERE id = ?\`, [id], (err, row) => {
                  if (err) reject(err);
                  else if (!row) reject(new Error("Tarefa não encontrada"));
                  else resolve({ ...row, completed: Boolean(row.completed) });
                });
              }
            }
          );
        });
        return reply.status(200).send(result);
      } catch (error) {
        if (error.message === "Tarefa não encontrada") {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(500).send({
          message: "Ocorreu um erro ao atualizar a tarefa: " + error.message,
        });
      }
    }
    ```

*   **`delete-task.js`**:
    ```javascript
    // filepath: backend/src/http/routes/controllers/delete-task.js
    import { db } from "../../../database/db.js";

    export async function deleteTask(request, reply) {
      const { id } = request.params;
      try {
        await new Promise((resolve, reject) => {
            db.run(\`DELETE FROM tasks WHERE id = ?\`, [id], function(error) {
                if (error) {
                    reject(error);
                } else if (this.changes === 0) {
                    reject(new Error("Tarefa não encontrada"));
                } else {
                    resolve();
                }
            });
        });
        return reply.status(200).send({ message: "Tarefa deletada com sucesso!" });
      } catch (error) {
        if (error.message === "Tarefa não encontrada") {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(500).send({
          message: "Ocorreu um erro ao deletar a tarefa: " + error.message,
        });
      }
    }
    ```

**5.6. Definição das Rotas (`src/http/routes/app-routes.js`)**

```javascript
// filepath: backend/src/http/routes/app-routes.js
import { createTask } from "./controllers/create-task.js";
import { getTasks } from "./controllers/get-tasks.js";
import { updateTask } from "./controllers/update-task.js";
import { deleteTask } from "./controllers/delete-task.js";

export async function appRoutes(app) {
  app.post("/tasks", createTask);
  app.get("/tasks", getTasks);
  app.put("/tasks/:id", updateTask);
  app.delete("/tasks/:id", deleteTask);
}
```

### 6. Executando o Backend

1.  No terminal, dentro da pasta `backend`, execute o comando:
    ```bash
    npm run dev
    ```
2.  O servidor deverá iniciar e exibir a mensagem: `Servidor rodando em http://localhost:3333`.
3.  O arquivo `database.db` será criado na raiz da pasta `backend` (se ainda não existir) e a tabela `tasks` será criada dentro dele.

### 7. Testando a API

Use uma ferramenta como Insomnia, Postman ou Thunder Client (extensão do VS Code) para testar os endpoints:

*   **`POST /tasks`**: Criar uma nova tarefa.
    *   Corpo da requisição (JSON):
        ```json
        {
          "title": "Minha Primeira Tarefa",
          "description": "Descrição da tarefa"
        }
        ```
        ou
        ```json
        {
          "title": "Tarefa completa",
          "description": "Esta já vem completa",
          "completed": true
        }
        ```
*   **`GET /tasks`**: Listar todas as tarefas.
*   **`PUT /tasks/:id`**: Atualizar uma tarefa existente (substitua `:id` pelo ID da tarefa).
    *   Corpo da requisição (JSON):
        ```json
        {
          "title": "Título Atualizado",
          "description": "Descrição atualizada",
          "completed": true
        }
        ```
*   **`DELETE /tasks/:id`**: Deletar uma tarefa (substitua `:id` pelo ID da tarefa).

Com este roteiro, o backend da sua aplicação de lista de tarefas estará funcional.
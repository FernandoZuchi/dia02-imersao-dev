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
// filepath: c:\Users\Fernando Zuchi\Desktop\dia02-imersao-dev\backend\src\database\db.js
import sqlite3 from 'sqlite3';

// Cria e exporta uma instância do banco de dados SQLite.
// O arquivo 'database.db' será criado no diretório raiz do backend se não existir.
// Este objeto 'db' será usado em toda a aplicação para interagir com o banco de dados.
export const db = new sqlite3.Database('database.db');
```

**5.2. Criação da Tabela (`src/database/migrations/create-table.js`)**

```javascript
import { db } from '../db.js';

// Função para criar a tabela 'tasks' no banco de dados se ela ainda não existir.
// Esta função é auto-executável para garantir que a tabela seja criada na inicialização da aplicação.
export function createTable() {
    // Executa um comando SQL para criar a tabela 'tasks'.
    // O comando 'CREATE TABLE IF NOT EXISTS' previne erros caso a tabela já exista.
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- Define 'id' como chave primária autoincrementável.
            title TEXT NOT NULL,                   -- Define 'title' como texto obrigatório.
            description TEXT,                      -- Define 'description' como texto opcional.
            completed BOOLEAN DEFAULT 0,           -- Define 'completed' como booleano, com valor padrão 0 (false).
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Define 'created_at' como data e hora, com valor padrão sendo o momento da criação.
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Define 'updated_at' como data e hora, com valor padrão sendo o momento da criação/atualização.
        );
    `);
}

createTable(); // Executa a função para garantir que a tabela seja criada ao carregar este módulo.
```

**5.3. Configuração do Aplicativo Fastify (`src/http/app.js`)**

```javascript
import fastify from "fastify";
import { appRoutes } from "./routes/app-routes.js";

// Cria uma instância do Fastify, que é o framework web utilizado.
export const app = fastify();

// Registra o plugin CORS (Cross-Origin Resource Sharing) do Fastify.
// Isso é crucial para permitir que o frontend (rodando em uma origem diferente, ex: localhost:5173)
// faça requisições para este backend (rodando em localhost:3333).
app.register(import("@fastify/cors"), {
    // 'origin' especifica quais origens são permitidas.
    // É uma boa prática listar explicitamente os endereços do frontend.
    origin: [
        "http://localhost:5173" // Endereço comum de desenvolvimento do frontend Vite/React
    ],
    // 'methods' especifica quais métodos HTTP são permitidos nas requisições CORS.
    methods: ["GET", "POST", "PUT", "DELETE"],
    // 'allowedHeaders' especifica quais cabeçalhos são permitidos nas requisições.
    allowedHeaders: ["Content-Type", "Authorization"],
});

// Registra as rotas da aplicação definidas em 'app-routes.js'.
// Todas as rotas definidas em 'appRoutes' serão adicionadas à instância do Fastify.
app.register(appRoutes);
```

**5.4. Servidor (`src/http/server.js`)**

```javascript
// filepath: backend/src/http/server.js
// Importa a instância configurada do Fastify (aplicação web).
import { app } from "./app.js";

// Importa o módulo de configuração do banco de dados.
// A simples importação deste arquivo executa o código nele, que estabelece a conexão com o SQLite.
import "../database/db.js"; // Importa para inicializar a conexão com o banco de dados.

// Importa o módulo de migração para criação da tabela.
// A simples importação deste arquivo executa a função 'createTable()',
// garantindo que a tabela 'tasks' exista antes do servidor começar a aceitar requisições.
import "../database/migrations/create-table.js"; // Importa para criar a tabela 'tasks' se não existir.

// Inicia o servidor Fastify.
app
    .listen({
        port: 3333, // Define a porta em que o servidor irá escutar.
    })
    .then(() => console.log("Servidor rodando em http://localhost:3333")); // Exibe uma mensagem no console quando o servidor inicia com sucesso.
```

**5.5. Controladores de Tarefas (`src/http/routes/controllers/`)**

*   **`create-task.js`**:
    ```javascript
    // filepath: backend/src/http/routes/controllers/create-task.js
    import { db } from "../../../database/db.js";

    // Função assíncrona para criar uma nova tarefa.
    export async function createTask(request, reply) {
        // Extrai 'title', 'description' e 'completed' do corpo da requisição.
        // 'completed' tem um valor padrão de 'false' se não for fornecido.
        const { title, description, completed = false } = request.body;

        // Validação: Verifica se o título da tarefa foi fornecido e não está vazio.
        if (!title?.trim()) {
            // Se o título for inválido, retorna um erro 400 (Bad Request).
            return reply
                .status(400)
                .send({ message: "O título da tarefa é obrigatório" });
        }

        try {
            // Envolve a operação de banco de dados em uma Promise para lidar com a natureza assíncrona do 'sqlite3'.
            const result = await new Promise((resolve, reject) => {
                // Executa o comando SQL para inserir uma nova tarefa na tabela 'tasks'.
                db.run(
                    `INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)`,
                    // 'title.trim()' remove espaços em branco do início e fim do título.
                    // 'description || ""' define uma string vazia se a descrição não for fornecida.
                    // 'completed ? 1 : 0' converte o valor booleano para 1 (true) ou 0 (false) para o SQLite.
                    [title.trim(), description || "", completed ? 1 : 0],
                    // A função de callback é chamada após a execução do comando 'run'.
                    // 'this' dentro desta função refere-se ao statement da execução.
                    function (error) {
                        if (error) {
                            // Se ocorrer um erro durante a inserção, rejeita a Promise.
                            reject(error);
                        } else {
                            // Se a inserção for bem-sucedida, busca a tarefa recém-criada usando 'this.lastID'.
                            // 'this.lastID' contém o ID da última linha inserida.
                            db.get(
                                `SELECT * FROM tasks WHERE id = ?`,
                                [this.lastID],
                                (err, row) => {
                                    if (err) {
                                        // Se ocorrer um erro ao buscar a tarefa, rejeita a Promise.
                                        reject(err);
                                    } else {
                                        // Se a busca for bem-sucedida, resolve a Promise com os dados da tarefa.
                                        // Converte o valor 'completed' de volta para booleano.
                                        resolve({ ...row, completed: Boolean(row.completed) });
                                    }
                                }
                            );
                        }
                    }
                );
            });
            // Retorna uma resposta 201 (Created) com os dados da tarefa criada.
            return reply.status(201).send(result);
        } catch (error) {
            // Se ocorrer qualquer erro durante o processo, retorna um erro 500 (Internal Server Error).
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

    // Função assíncrona para buscar todas as tarefas.
    export async function getTasks(request, reply) {
        try {
            // Envolve a operação de banco de dados em uma Promise.
            const tasks = await new Promise((resolve, reject) => {
                // Executa o comando SQL para selecionar todas as tarefas, ordenadas pela data de criação (mais recentes primeiro).
                db.all(`SELECT * FROM tasks ORDER BY created_at DESC`, (error, rows) => {
                    if (error) {
                        // Se ocorrer um erro durante a busca, rejeita a Promise.
                        reject(error);
                    } else {
                        // Se a busca for bem-sucedida, mapeia os resultados.
                        // Converte o valor 'completed' de cada tarefa para booleano.
                        // O SQLite armazena booleanos como 0 ou 1.
                        resolve(rows.map((task) => ({ ...task, completed: Boolean(task.completed) })));
                    }
                });
            });
            // Retorna a lista de tarefas. O Fastify automaticamente envia como JSON com status 200 (OK).
            return tasks;
        } catch (error) {
            // Se ocorrer qualquer erro durante o processo, retorna um erro 500 (Internal Server Error).
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

    // Função assíncrona para atualizar uma tarefa existente.
    export async function updateTask(request, reply) {
        // Extrai o 'id' da tarefa dos parâmetros da rota.
        const { id } = request.params;
        // Extrai 'title', 'description' e 'completed' do corpo da requisição.
        const { title, description, completed } = request.body;

        // Validação: Verifica se o título da tarefa foi fornecido e não está vazio.
        if (!title?.trim()) {
            // Se o título for inválido, retorna um erro 400 (Bad Request).
            return reply
                .status(400)
                .send({ message: "O título da tarefa é obrigatório" });
        }

        try {
            // Envolve a operação de banco de dados em uma Promise.
            const result = await new Promise((resolve, reject) => {
                // Executa o comando SQL para atualizar a tarefa.
                // Define 'title', 'description', 'completed' e atualiza 'updated_at' para o timestamp atual.
                db.run(
                    `UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    // Os valores são passados como um array.
                    [title.trim(), description || "", completed ? 1 : 0, id],
                    // A função de callback é chamada após a execução do comando 'run'.
                    function (error) {
                        if (error) {
                            // Se ocorrer um erro durante a atualização, rejeita a Promise.
                            reject(error);
                        } else {
                            // Se a atualização for bem-sucedida, busca a tarefa atualizada para retornar na resposta.
                            db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
                                if (err) {
                                    // Se ocorrer um erro ao buscar a tarefa, rejeita a Promise.
                                    reject(err);
                                } else if (!row) {
                                    // Se nenhuma tarefa com o 'id' fornecido for encontrada após a tentativa de atualização,
                                    // (embora 'db.run' não falhe se o ID não existir, 'this.changes' seria 0),
                                    // é uma boa prática verificar se a linha existe antes de resolver.
                                    reject(new Error("Tarefa não encontrada"));
                                } else {
                                    // Se a busca for bem-sucedida, resolve a Promise com os dados da tarefa atualizada.
                                    // Converte o valor 'completed' de volta para booleano.
                                    resolve({ ...row, completed: Boolean(row.completed) });
                                }
                            });
                        }
                    }
                );
            });
            // Retorna uma resposta 200 (OK) com os dados da tarefa atualizada.
            return reply.status(200).send(result);
        } catch (error) {
            // Trata erros específicos, como "Tarefa não encontrada".
            if (error.message === "Tarefa não encontrada") {
                // Se a tarefa não for encontrada, retorna um erro 404 (Not Found).
                return reply.status(404).send({ message: error.message });
            }
            // Para outros erros, retorna um erro 500 (Internal Server Error).
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

    // Função assíncrona para deletar uma tarefa existente.
    export async function deleteTask(request, reply) {
        // Extrai o 'id' da tarefa dos parâmetros da rota (ex: /tasks/:id).
        const { id } = request.params;
        try {
            // Envolve a operação de banco de dados em uma Promise.
            await new Promise((resolve, reject) => {
                // Executa o comando SQL para deletar a tarefa com o 'id' fornecido.
                db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(error) {
                    // 'this' dentro desta função refere-se ao statement da execução.
                    if (error) {
                        // Se ocorrer um erro durante a deleção, rejeita a Promise.
                        reject(error);
                    } else if (this.changes === 0) {
                        // 'this.changes' indica o número de linhas afetadas pelo comando.
                        // Se 'this.changes' for 0, significa que nenhuma tarefa com o 'id' fornecido foi encontrada.
                        reject(new Error("Tarefa não encontrada"));
                    } else {
                        // Se a deleção for bem-sucedida, resolve a Promise.
                        resolve();
                    }
                });
            });
            // Retorna uma resposta 200 (OK) com uma mensagem de sucesso.
            return reply.status(200).send({ message: "Tarefa deletada com sucesso!" });
        } catch (error) {
            // Trata erros específicos, como "Tarefa não encontrada".
            if (error.message === "Tarefa não encontrada") {
                // Se a tarefa não for encontrada, retorna um erro 404 (Not Found).
                return reply.status(404).send({ message: error.message });
            }
            // Para outros erros, retorna um erro 500 (Internal Server Error).
            return reply.status(500).send({
                message: "Ocorreu um erro ao deletar a tarefa: " + error.message,
            });
        }
    }
    ```

**5.6. Definição das Rotas (`src/http/routes/app-routes.js`)**

```javascript
// filepath: backend/src/http/routes/app-routes.js
// Importa as funções controladoras para cada rota.
import { createTask } from "./controllers/create-task.js";
import { getTasks } from "./controllers/get-tasks.js";
import { updateTask } from "./controllers/update-task.js";
import { deleteTask } from "./controllers/delete-task.js";

// Função assíncrona para registrar todas as rotas da aplicação.
// 'app' é a instância do Fastify.
export async function appRoutes(app) {
    // Define a rota POST para '/tasks' que utilizará a função 'createTask'.
    // Usada para criar novas tarefas.
    app.post("/tasks", createTask);

    // Define a rota GET para '/tasks' que utilizará a função 'getTasks'.
    // Usada para listar todas as tarefas.
    app.get("/tasks", getTasks);

    // Define a rota PUT para '/tasks/:id' que utilizará a função 'updateTask'.
    // ':id' é um parâmetro de rota que identifica a tarefa a ser atualizada.
    // Usada para modificar uma tarefa existente.
    app.put("/tasks/:id", updateTask);

    // Define a rota DELETE para '/tasks/:id' que utilizará a função 'deleteTask'.
    // ':id' é um parâmetro de rota que identifica a tarefa a ser deletada.
    // Usada para remover uma tarefa existente.
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

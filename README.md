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
    Este comando cria um arquivo `package.json` com as configurações padrão, que gerencia as dependências e scripts do projeto.

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
    ├── http/
    │   ├── app.js
    │   ├── server.js
    │   └── routes/
    │       ├── app-routes.js
    │       └── controllers/
    │           ├── create-task.js
    │           ├── get-tasks.js
    │           ├── update-task.js
    │           └── delete-task.js
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
  "main": "index.js", // Ponto de entrada principal, embora usemos server.js com type: module
  "type": "module", // Essencial para usar 'import' e 'export' (ES Modules)
  "scripts": {
    "dev": "node --watch ./src/http/server.js" // Script para rodar o servidor com reinício automático ao detectar alterações
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@fastify/cors": "^11.0.1", // Dependência para gerenciar CORS
    "fastify": "^5.3.3", // Framework web
    "sqlite3": "^5.1.7" // Driver do banco de dados SQLite
  }
}
```
A configuração `"type": "module"` permite o uso da sintaxe moderna de módulos JavaScript (`import`/`export`). O script `"dev"` utiliza `node --watch` para reiniciar o servidor automaticamente sempre que um arquivo do projeto for alterado, agilizando o desenvolvimento.

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
Este código importa a biblioteca `sqlite3` e cria uma nova instância de banco de dados. O arquivo `database.db` será criado na raiz da pasta `backend` (se não existir) e armazenará todos os dados da aplicação. A constante `db` é exportada para ser utilizada em outras partes do backend para executar operações no banco de dados.

**5.2. Criação da Tabela (`src/database/migrations/create-table.js`)**

```javascript
import { db } from '../db.js'; // Importa a instância do banco de dados configurada anteriormente.

// Função para criar a tabela 'tasks' no banco de dados se ela ainda não existir.
// Esta função é auto-executável para garantir que a tabela seja criada na inicialização da aplicação.
export function createTable() {
    // Executa um comando SQL para criar a tabela 'tasks'.
    // 'IF NOT EXISTS' previne erros caso a tabela já tenha sido criada.
    // A tabela 'tasks' terá as colunas:
    // - id: INTEGER PRIMARY KEY AUTOINCREMENT (identificador único que se auto-incrementa)
    // - title: TEXT (título da tarefa)
    // - description: TEXT (descrição da tarefa)
    // - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP (data e hora de criação, com valor padrão sendo o momento atual)
    // - updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP (data e hora da última atualização)
    // - completed_at: TIMESTAMP (data e hora de conclusão da tarefa, pode ser nulo)
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        );
    `);
}

createTable(); // Executa a função para garantir que a tabela seja criada ao carregar este módulo.
```
Este script define e executa uma função para criar a tabela `tasks` no banco de dados. Ele importa a conexão `db` e utiliza o método `db.run()` para executar uma instrução SQL `CREATE TABLE IF NOT EXISTS`. Isso garante que a tabela de tarefas, com suas respectivas colunas e tipos de dados, seja criada automaticamente quando a aplicação iniciar, caso ainda não exista. A chamada `createTable()` no final do arquivo faz com que a função seja executada assim que o arquivo é importado.

**5.3. Configuração do Aplicativo Fastify (`src/http/app.js`)**

```javascript
import fastify from "fastify"; // Importa o framework Fastify.
import { appRoutes } from "./routes/app-routes.js"; // Importa as definições de rotas da aplicação.
import cors from "@fastify/cors"; // Importa o plugin CORS para Fastify.

// Cria uma instância do Fastify, que é o framework web utilizado.
export const app = fastify();

// Registra o plugin CORS (Cross-Origin Resource Sharing) do Fastify.
// Isso é crucial para permitir que o frontend (rodando em uma origem diferente, ex: localhost:5173)
// faça requisições para este backend (rodando em localhost:3333).
app.register(cors, {
  // 'origin' especifica quais origens são permitidas.
  // É uma boa prática listar explicitamente os endereços do frontend.
  // O valor true permite qualquer origem, mas para produção é recomendado especificar.
  origin: true, // Permite requisições de qualquer origem (para desenvolvimento). Em produção, especifique as URLs do frontend.
  // 'methods' especifica quais métodos HTTP são permitidos nas requisições CORS.
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  // 'allowedHeaders' especifica quais cabeçalhos são permitidos nas requisições.
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Registra as rotas da aplicação definidas em 'app-routes.js'.
// Todas as rotas definidas em 'appRoutes' serão adicionadas à instância do Fastify.
app.register(appRoutes);
```
Aqui, configuramos a aplicação Fastify.
1.  Importamos `fastify`, o plugin `@fastify/cors` e as rotas definidas em `app-routes.js`.
2.  Criamos uma instância do Fastify (`app`).
3.  Registramos o plugin `cors` para permitir que o frontend (que roda em uma porta diferente) possa fazer requisições para este backend. A configuração `origin: true` é geralmente usada para desenvolvimento, permitindo acesso de qualquer origem. Para produção, é mais seguro especificar as URLs exatas do frontend. `methods` e `allowedHeaders` definem quais tipos de requisições e cabeçalhos são permitidos.
4.  Finalmente, registramos as `appRoutes`, que contêm a lógica para os diferentes endpoints da API (como criar, listar, atualizar e deletar tarefas).

**5.4. Ponto de Entrada do Servidor (`src/http/server.js`)**
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
    host: '0.0.0.0', // Faz o servidor escutar em todas as interfaces de rede disponíveis.
    port: 3333, // Define a porta em que o servidor irá escutar.
  })
  .then(() => console.log("Servidor rodando em http://localhost:3333")); // Exibe uma mensagem no console quando o servidor inicia com sucesso.

```
Este é o arquivo principal que inicia o servidor.
1.  Importa a instância `app` do Fastify configurada em `app.js`.
2.  Importa `db.js` e `create-table.js`. Apenas importar esses arquivos já executa o código neles: `db.js` estabelece a conexão com o banco de dados SQLite, e `create-table.js` garante que a tabela `tasks` seja criada se ainda não existir. Isso é crucial para que o banco de dados esteja pronto antes que o servidor comece a aceitar requisições.
3.  `app.listen()` inicia o servidor Fastify. Ele é configurado para escutar na porta `3333` e em `0.0.0.0` (o que significa que aceitará conexões de qualquer endereço IP, útil para acesso em rede local ou em contêineres).
4.  Após o servidor iniciar com sucesso, uma mensagem é exibida no console.

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
Este controlador é responsável por criar uma nova tarefa.
1.  Ele extrai `title`, `description`, e `completed` do corpo (`request.body`) da requisição HTTP. O campo `completed` tem um valor padrão `false`.
2.  Valida se o `title` foi fornecido; caso contrário, retorna um erro 400 (Bad Request).
3.  Dentro de um bloco `try...catch` para tratamento de erros, ele usa uma `Promise` para interagir com o banco de dados de forma assíncrona.
4.  O comando `db.run()` insere a nova tarefa na tabela `tasks`. Os valores são sanitizados (ex: `title.trim()`) e o booleano `completed` é convertido para `1` ou `0` para o SQLite.
5.  Após a inserção, `this.lastID` (disponível no callback do `db.run`) é usado para buscar a tarefa recém-criada com `db.get()`. Isso permite retornar os dados completos da tarefa, incluindo seu `id` gerado automaticamente e `created_at`.
6.  O valor `completed` é convertido de volta para booleano antes de ser enviado na resposta.
7.  Se tudo ocorrer bem, retorna um status 201 (Created) com os dados da nova tarefa. Caso contrário, retorna um erro 500 (Internal Server Error).

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
Este controlador busca todas as tarefas do banco de dados.
1.  Ele utiliza uma `Promise` para envolver a operação assíncrona `db.all()`.
2.  O comando SQL `SELECT * FROM tasks ORDER BY created_at DESC` busca todas as colunas de todas as tarefas, ordenando-as pela data de criação em ordem decrescente (as mais recentes primeiro).
3.  No callback do `db.all()`, se não houver erro, ele mapeia os resultados (`rows`) para converter o campo `completed` (que é `0` ou `1` no SQLite) de volta para um valor booleano (`true` ou `false`) para cada tarefa.
4.  Retorna a lista de tarefas. O Fastify automaticamente envia a resposta como JSON com status 200 (OK).
5.  Em caso de erro, retorna um status 500 (Internal Server Error).

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
Este controlador atualiza uma tarefa existente.
1.  Extrai o `id` da tarefa dos parâmetros da rota (`request.params`) e os campos `title`, `description`, e `completed` do corpo da requisição (`request.body`).
2.  Valida se o `title` foi fornecido.
3.  Usa uma `Promise` para a operação assíncrona com o banco de dados.
4.  O comando `db.run()` atualiza a tarefa na tabela `tasks` onde o `id` corresponde. Ele atualiza `title`, `description`, `completed` (convertido para `0` ou `1`), e também o campo `updated_at` para o timestamp atual.
5.  Após a atualização, `db.get()` busca a tarefa atualizada pelo `id` para retornar os dados mais recentes.
6.  Verifica se a tarefa foi encontrada (`row`). Se não, rejeita a `Promise` com um erro "Tarefa não encontrada".
7.  Converte `completed` de volta para booleano.
8.  Se bem-sucedido, retorna status 200 (OK) com os dados da tarefa atualizada.
9.  Trata erros específicos: se a tarefa não for encontrada, retorna 404 (Not Found); para outros erros, retorna 500 (Internal Server Error).

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
Este controlador deleta uma tarefa existente.
1.  Extrai o `id` da tarefa dos parâmetros da rota (`request.params`).
2.  Usa uma `Promise` para a operação assíncrona.
3.  O comando `db.run()` deleta a tarefa da tabela `tasks` onde o `id` corresponde.
4.  No callback do `db.run()`, verifica `this.changes`. Se for `0`, significa que nenhuma linha foi afetada (tarefa não encontrada), então rejeita a `Promise`.
5.  Se a deleção for bem-sucedida (`this.changes > 0`), resolve a `Promise`.
6.  Retorna status 200 (OK) com uma mensagem de sucesso.
7.  Trata erros: se a tarefa não for encontrada, retorna 404 (Not Found); para outros erros, retorna 500 (Internal Server Error).

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
Este arquivo é responsável por definir e registrar todas as rotas da API da aplicação.
1.  Ele importa as funções controladoras (`createTask`, `getTasks`, `updateTask`, `deleteTask`) de seus respectivos arquivos na pasta `controllers`.
2.  Exporta uma função assíncrona `appRoutes` que recebe a instância do Fastify (`app`) como argumento.
3.  Dentro de `appRoutes`, cada rota da API é definida usando os métodos HTTP correspondentes do Fastify (`app.post`, `app.get`, `app.put`, `app.delete`):
    *   `POST /tasks`: Mapeia para o controlador `createTask`, usado para criar novas tarefas.
    *   `GET /tasks`: Mapeia para o controlador `getTasks`, usado para listar todas as tarefas.
    *   `PUT /tasks/:id`: Mapeia para o controlador `updateTask`. O `:id` é um parâmetro de rota que captura o ID da tarefa a ser atualizada.
    *   `DELETE /tasks/:id`: Mapeia para o controlador `deleteTask`. O `:id` é um parâmetro de rota que captura o ID da tarefa a ser deletada.
Quando a instância do Fastify (`app`) registra `appRoutes` (como visto em `src/http/app.js`), essas rotas se tornam ativas e prontas para receber requisições.

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

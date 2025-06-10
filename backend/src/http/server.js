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
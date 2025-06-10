// Importa a instância da aplicação Fastify.
import { app } from "./app.js";

// Importa a configuração do banco de dados (inicializa a conexão).
import "../database/db.js";
// Importa e executa o script de criação da tabela (garante que a tabela 'tasks' exista).
import "../database/migrations/create-table.js";

// Inicia o servidor Fastify.
app
  .listen({
    port: 3333, // Define a porta em que o servidor vai escutar.
  })
  // Exibe uma mensagem no console quando o servidor estiver rodando.
  .then(() => console.log("Servidor rodando em http://localhost:3333"));

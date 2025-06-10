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
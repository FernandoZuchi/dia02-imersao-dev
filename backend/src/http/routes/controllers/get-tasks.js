// Importa a instância do banco de dados.
import { db } from "../../../database/db.js";

// Função assíncrona para buscar todas as tarefas.
export async function getTasks(request, reply) {
  try {
    // Cria uma nova Promise para lidar com a operação assíncrona do banco de dados.
    const tasks = await new Promise((resolve, reject) => {
      // Executa o comando SQL para selecionar todas as tarefas, ordenadas pela data de criação decrescente.
      db.all(`SELECT * FROM tasks ORDER BY created_at DESC`, (error, rows) => {
        if (error) reject(error); // Rejeita a Promise se houver erro na busca.
        else
          resolve(
            // Mapeia os resultados, convertendo 'completed' para booleano.
            rows.map((task) => ({
              ...task,
              completed: Boolean(task.completed),
            }))
          );
      });
    });

    // Retorna a lista de tarefas.
    return tasks;
  } catch (error) {
    // Em caso de erro durante o processo, retorna um status 500 (Internal Server Error).
    return reply.status(500).send({
      message: "Ocorreu um erro ao buscar as tarefas: " + error.message,
    });
  }
}

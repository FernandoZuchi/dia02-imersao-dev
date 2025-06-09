import { db } from "../../../database/db.js";

export async function getTasks(request, reply) {
  try {
    const tasks = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM tasks ORDER BY created_at DESC`, (error, rows) => {
        if (error) reject(error);
        else
          resolve(
            rows.map((task) => ({
              ...task,
              completed: Boolean(task.completed),
            }))
          );
      });
    });

    return tasks;
  } catch (error) {
    return reply.status(500).send({
      message: "Ocorreu um erro ao buscar as tarefas: " + error.message,
    });
  }
}

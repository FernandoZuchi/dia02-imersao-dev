// Importa as funções controladoras das rotas.
import { createTask } from "./controllers/create-task.js";
import { getTasks } from "./controllers/get-tasks.js";
import { updateTask } from "./controllers/update-task.js";
import { deleteTask } from "./controllers/delete-task.js";

// Função assíncrona para registrar as rotas da aplicação no servidor Fastify.
export async function appRoutes(app) {
  // Define a rota POST para criar tarefas.
  app.post("/tasks", createTask);
  // Define a rota GET para buscar todas as tarefas.
  app.get("/tasks", getTasks);
  // Define a rota PUT para atualizar uma tarefa específica pelo ID.
  app.put("/tasks/:id", updateTask);
  // Define a rota DELETE para deletar uma tarefa específica pelo ID.
  app.delete("/tasks/:id", deleteTask);
}

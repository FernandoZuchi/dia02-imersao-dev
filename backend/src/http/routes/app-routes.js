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
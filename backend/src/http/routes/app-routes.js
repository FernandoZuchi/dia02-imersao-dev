import { createTask } from "./controllers/create-task.js";
import { getTasks } from "./controllers/get-tasks.js";
import { updateTask } from "./controllers/update-task.js";
import { deleteTask } from "./controllers/delete-task.js";

export async function appRoutes(app) {
    app.post('/tasks', createTask);
    app.get('/tasks', getTasks);
    app.put('/tasks/:id', updateTask);
    app.delete('/tasks/:id', deleteTask);
}
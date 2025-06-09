import { db } from "../../../database/db.js";

export async function createTask(request, reply) {
  const { title, description, completed = false } = request.body;

  if (!title?.trim()) {
    return reply.status(400).send({ message: "O título da tarefa é obrigatório" });
  }

  try {
    db.run(
      `INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)`,
      [title.trim(), description || '', completed ? 1 : 0]
    );

    return reply.status(201).send({ message: "Tarefa criada com sucesso!" });
  } catch (error) {
    return reply.status(500).send({
      message: "Ocorreu um erro ao criar a tarefa: " + error.message,
    });
  }
}

import { db } from "../../../database/db.js";

export async function updateTask(request, reply) {
  const { id } = request.params;
  const { title, description, completed } = request.body;

  if (!title?.trim()) {
    return reply
      .status(400)
      .send({ message: "O título da tarefa é obrigatório" });
  }

  try {
    db.run(
      `UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title.trim(), description || "", completed ? 1 : 0, id]
    );

    return reply
      .status(200)
      .send({ message: "Tarefa atualizada com sucesso!" });
  } catch (error) {
    return reply.status(500).send({
      message: "Ocorreu um erro ao atualizar a tarefa: " + error.message,
    });
  }
}

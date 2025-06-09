import { db } from "../../../database/db.js";

export async function deleteTask(request, reply) {
  const { id } = request.params;

  try {
    db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
    return reply.status(200).send({ message: "Tarefa deletada com sucesso!" });
  } catch (error) {
    return reply.status(500).send({
      message: "Ocorreu um erro ao deletar a tarefa: " + error.message,
    });
  }
}

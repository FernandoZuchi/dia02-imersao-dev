// Importa a instância do banco de dados.
import { db } from "../../../database/db.js";

// Função assíncrona para deletar uma tarefa.
export async function deleteTask(request, reply) {
  // Extrai o ID da tarefa dos parâmetros da rota.
  const { id } = request.params;

  try {
    // Executa o comando SQL para deletar a tarefa com o ID especificado.
    db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
    // Retorna uma mensagem de sucesso com status 200 (OK).
    return reply.status(200).send({ message: "Tarefa deletada com sucesso!" });
  } catch (error) {
    // Em caso de erro durante o processo, retorna um status 500 (Internal Server Error).
    return reply.status(500).send({
      message: "Ocorreu um erro ao deletar a tarefa: " + error.message,
    });
  }
}

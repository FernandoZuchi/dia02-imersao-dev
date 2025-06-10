// filepath: backend/src/http/routes/controllers/delete-task.js
import { db } from "../../../database/db.js";

// Função assíncrona para deletar uma tarefa existente.
export async function deleteTask(request, reply) {
  // Extrai o 'id' da tarefa dos parâmetros da rota (ex: /tasks/:id).
  const { id } = request.params;
  try {
    // Envolve a operação de banco de dados em uma Promise.
    await new Promise((resolve, reject) => {
        // Executa o comando SQL para deletar a tarefa com o 'id' fornecido.
        db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(error) {
            // 'this' dentro desta função refere-se ao statement da execução.
            if (error) {
                // Se ocorrer um erro durante a deleção, rejeita a Promise.
                reject(error);
            } else if (this.changes === 0) {
                // 'this.changes' indica o número de linhas afetadas pelo comando.
                // Se 'this.changes' for 0, significa que nenhuma tarefa com o 'id' fornecido foi encontrada.
                reject(new Error("Tarefa não encontrada"));
            } else {
                // Se a deleção for bem-sucedida, resolve a Promise.
                resolve();
            }
        });
    });
    // Retorna uma resposta 200 (OK) com uma mensagem de sucesso.
    return reply.status(200).send({ message: "Tarefa deletada com sucesso!" });
  } catch (error) {
    // Trata erros específicos, como "Tarefa não encontrada".
    if (error.message === "Tarefa não encontrada") {
      // Se a tarefa não for encontrada, retorna um erro 404 (Not Found).
      return reply.status(404).send({ message: error.message });
    }
    // Para outros erros, retorna um erro 500 (Internal Server Error).
    return reply.status(500).send({
      message: "Ocorreu um erro ao deletar a tarefa: " + error.message,
    });
  }
}
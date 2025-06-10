// Importa a instância do banco de dados.
import { db } from "../../../database/db.js";

// Função assíncrona para atualizar uma tarefa existente.
export async function updateTask(request, reply) {
  // Extrai o ID da tarefa dos parâmetros da rota.
  const { id } = request.params;
  // Extrai title, description e completed do corpo da requisição.
  const { title, description, completed } = request.body;

  // Valida se o título da tarefa foi fornecido.
  if (!title?.trim()) {
    return reply
      .status(400)
      .send({ message: "O título da tarefa é obrigatório" });
  }

  try {
    // Cria uma nova Promise para lidar com a operação assíncrona do banco de dados.
    const result = await new Promise((resolve, reject) => {
      // Executa o comando SQL para atualizar a tarefa.
      db.run(
        `UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [title.trim(), description || "", completed ? 1 : 0, id], // Trata os dados e converte 'completed' para 0 ou 1.
        function (error) {
          if (error) reject(error); // Rejeita a Promise se houver erro na atualização.
          else {
            // Se a atualização for bem-sucedida, busca a tarefa atualizada para retornar os dados completos.
            db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
              if (err) reject(err); // Rejeita a Promise se houver erro na busca.
              else if (!row) reject(new Error("Tarefa não encontrada")); // Rejeita se a tarefa não for encontrada.
              else
                resolve({ // Resolve a Promise com os dados da tarefa atualizada, convertendo 'completed' para booleano.
                  ...row,
                  completed: Boolean(row.completed),
                });
            });
          }
        }
      );
    });

    // Retorna a tarefa atualizada com status 200 (OK).
    return reply.status(200).send(result);
  } catch (error) {
    // Em caso de erro durante o processo, retorna um status 500 (Internal Server Error) ou 404 se a tarefa não for encontrada.
    if (error.message === "Tarefa não encontrada") {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({
      message: "Ocorreu um erro ao atualizar a tarefa: " + error.message,
    });
  }
}

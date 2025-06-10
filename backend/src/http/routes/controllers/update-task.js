// filepath: backend/src/http/routes/controllers/update-task.js
import { db } from "../../../database/db.js";

// Função assíncrona para atualizar uma tarefa existente.
export async function updateTask(request, reply) {
  // Extrai o 'id' da tarefa dos parâmetros da rota.
  const { id } = request.params;
  // Extrai 'title', 'description' e 'completed' do corpo da requisição.
  const { title, description, completed } = request.body;

  // Validação: Verifica se o título da tarefa foi fornecido e não está vazio.
  if (!title?.trim()) {
    // Se o título for inválido, retorna um erro 400 (Bad Request).
    return reply
      .status(400)
      .send({ message: "O título da tarefa é obrigatório" });
  }

  try {
    // Envolve a operação de banco de dados em uma Promise.
    const result = await new Promise((resolve, reject) => {
      // Executa o comando SQL para atualizar a tarefa.
      // Define 'title', 'description', 'completed' e atualiza 'updated_at' para o timestamp atual.
      db.run(
        `UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        // Os valores são passados como um array.
        [title.trim(), description || "", completed ? 1 : 0, id],
        // A função de callback é chamada após a execução do comando 'run'.
        function (error) {
          if (error) {
            // Se ocorrer um erro durante a atualização, rejeita a Promise.
            reject(error);
          } else {
            // Se a atualização for bem-sucedida, busca a tarefa atualizada para retornar na resposta.
            db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
              if (err) {
                // Se ocorrer um erro ao buscar a tarefa, rejeita a Promise.
                reject(err);
              } else if (!row) {
                // Se nenhuma tarefa com o 'id' fornecido for encontrada após a tentativa de atualização,
                // (embora 'db.run' não falhe se o ID não existir, 'this.changes' seria 0),
                // é uma boa prática verificar se a linha existe antes de resolver.
                reject(new Error("Tarefa não encontrada"));
              } else {
                // Se a busca for bem-sucedida, resolve a Promise com os dados da tarefa atualizada.
                // Converte o valor 'completed' de volta para booleano.
                resolve({ ...row, completed: Boolean(row.completed) });
              }
            });
          }
        }
      );
    });
    // Retorna uma resposta 200 (OK) com os dados da tarefa atualizada.
    return reply.status(200).send(result);
  } catch (error) {
    // Trata erros específicos, como "Tarefa não encontrada".
    if (error.message === "Tarefa não encontrada") {
      // Se a tarefa não for encontrada, retorna um erro 404 (Not Found).
      return reply.status(404).send({ message: error.message });
    }
    // Para outros erros, retorna um erro 500 (Internal Server Error).
    return reply.status(500).send({
      message: "Ocorreu um erro ao atualizar a tarefa: " + error.message,
    });
  }
}
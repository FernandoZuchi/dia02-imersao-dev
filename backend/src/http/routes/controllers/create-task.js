// Importa a instância do banco de dados.
import { db } from "../../../database/db.js";

// Função assíncrona para criar uma nova tarefa.
export async function createTask(request, reply) {
  // Extrai title, description e completed do corpo da requisição.
  // Define completed como false por padrão se não for fornecido.
  const { title, description, completed = false } = request.body;

  // Valida se o título da tarefa foi fornecido.
  if (!title?.trim()) {
    return reply
      .status(400)
      .send({ message: "O título da tarefa é obrigatório" });
  }

  try {
    // Cria uma nova Promise para lidar com a operação assíncrona do banco de dados.
    const result = await new Promise((resolve, reject) => {
      // Executa o comando SQL para inserir a nova tarefa.
      db.run(
        `INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)`,
        [title.trim(), description || "", completed ? 1 : 0], // Trata o título, define description como string vazia se nulo, e converte completed para 0 ou 1.
        function (error) {
          if (error) reject(error); // Rejeita a Promise se houver erro na inserção.
          else {
            // Se a inserção for bem-sucedida, busca a tarefa recém-criada para retornar os dados completos.
            db.get(
              `SELECT * FROM tasks WHERE id = ?`,
              [this.lastID], // Usa o ID da última linha inserida.
              (err, row) => {
                if (err) reject(err); // Rejeita a Promise se houver erro na busca.
                else
                  resolve({ // Resolve a Promise com os dados da tarefa, convertendo 'completed' para booleano.
                    ...row,
                    completed: Boolean(row.completed),
                  });
              }
            );
          }
        }
      );
    });

    // Retorna a tarefa criada com status 201 (Created).
    return reply.status(201).send(result);
  } catch (error) {
    // Em caso de erro durante o processo, retorna um status 500 (Internal Server Error).
    return reply.status(500).send({
      message: "Ocorreu um erro ao criar a tarefa: " + error.message,
    });
  }
}

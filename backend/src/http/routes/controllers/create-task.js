// filepath: backend/src/http/routes/controllers/create-task.js
import { db } from "../../../database/db.js";

// Função assíncrona para criar uma nova tarefa.
export async function createTask(request, reply) {
  // Extrai 'title', 'description' e 'completed' do corpo da requisição.
  // 'completed' tem um valor padrão de 'false' se não for fornecido.
  const { title, description, completed = false } = request.body;

  // Validação: Verifica se o título da tarefa foi fornecido e não está vazio.
  if (!title?.trim()) {
    // Se o título for inválido, retorna um erro 400 (Bad Request).
    return reply
      .status(400)
      .send({ message: "O título da tarefa é obrigatório" });
  }

  try {
    // Envolve a operação de banco de dados em uma Promise para lidar com a natureza assíncrona do 'sqlite3'.
    const result = await new Promise((resolve, reject) => {
      // Executa o comando SQL para inserir uma nova tarefa na tabela 'tasks'.
      db.run(
        `INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)`,
        // 'title.trim()' remove espaços em branco do início e fim do título.
        // 'description || ""' define uma string vazia se a descrição não for fornecida.
        // 'completed ? 1 : 0' converte o valor booleano para 1 (true) ou 0 (false) para o SQLite.
        [title.trim(), description || "", completed ? 1 : 0],
        // A função de callback é chamada após a execução do comando 'run'.
        // 'this' dentro desta função refere-se ao statement da execução.
        function (error) {
          if (error) {
            // Se ocorrer um erro durante a inserção, rejeita a Promise.
            reject(error);
          } else {
            // Se a inserção for bem-sucedida, busca a tarefa recém-criada usando 'this.lastID'.
            // 'this.lastID' contém o ID da última linha inserida.
            db.get(
              `SELECT * FROM tasks WHERE id = ?`,
              [this.lastID],
              (err, row) => {
                if (err) {
                  // Se ocorrer um erro ao buscar a tarefa, rejeita a Promise.
                  reject(err);
                } else {
                  // Se a busca for bem-sucedida, resolve a Promise com os dados da tarefa.
                  // Converte o valor 'completed' de volta para booleano.
                  resolve({ ...row, completed: Boolean(row.completed) });
                }
              }
            );
          }
        }
      );
    });
    // Retorna uma resposta 201 (Created) com os dados da tarefa criada.
    return reply.status(201).send(result);
  } catch (error) {
    // Se ocorrer qualquer erro durante o processo, retorna um erro 500 (Internal Server Error).
    return reply.status(500).send({
      message: "Ocorreu um erro ao criar a tarefa: " + error.message,
    });
  }
}
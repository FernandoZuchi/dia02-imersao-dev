import { db } from '../db.js';

// Função para criar a tabela 'tasks' no banco de dados se ela ainda não existir.
// Esta função é auto-executável para garantir que a tabela seja criada na inicialização da aplicação.
export function createTable() {
    // Executa um comando SQL para criar a tabela 'tasks'.
    // O comando 'CREATE TABLE IF NOT EXISTS' previne erros caso a tabela já exista.
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- Define 'id' como chave primária autoincrementável.
            title TEXT NOT NULL,                   -- Define 'title' como texto obrigatório.
            description TEXT,                      -- Define 'description' como texto opcional.
            completed BOOLEAN DEFAULT 0,           -- Define 'completed' como booleano, com valor padrão 0 (false).
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Define 'created_at' como data e hora, com valor padrão sendo o momento da criação.
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Define 'updated_at' como data e hora, com valor padrão sendo o momento da criação/atualização.
        );
    `);
}

createTable(); // Executa a função para garantir que a tabela seja criada ao carregar este módulo.
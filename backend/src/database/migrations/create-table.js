// Importa a instância do banco de dados.
import { db } from '../db.js';

// Função para criar a tabela 'tasks' se ela não existir.
export function createTable() {

    // Executa o comando SQL para criar a tabela.
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `)
}

// Chama a função para criar a tabela ao iniciar o módulo.
createTable();
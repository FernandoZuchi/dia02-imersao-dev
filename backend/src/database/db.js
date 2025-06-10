// filepath: c:\Users\Fernando Zuchi\Desktop\dia02-imersao-dev\backend\src\database\db.js
import sqlite3 from 'sqlite3';

// Cria e exporta uma instância do banco de dados SQLite.
// O arquivo 'database.db' será criado no diretório raiz do backend se não existir.
// Este objeto 'db' será usado em toda a aplicação para interagir com o banco de dados.
export const db = new sqlite3.Database('database.db');
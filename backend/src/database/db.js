// Importa o driver sqlite3.
import sqlite3 from 'sqlite3';

// Cria e exporta uma nova instância do banco de dados SQLite, conectando-se ao arquivo 'database.db'.
export const db = new sqlite3.Database('database.db');
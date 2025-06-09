import { app } from "./app.js";

import '../database/db.js';
import '../database/migrations/create-table.js';

app.listen({
    port: 3333
}).then(() => console.log('Servidor rodando em http://localhost:3333'));
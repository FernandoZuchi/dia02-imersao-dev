// Importa o framework Fastify.
import fastify from "fastify";
// Importa as definições de rotas da aplicação.
import { appRoutes } from "./routes/app-routes.js";

// Cria uma instância do Fastify.
export const app = fastify();

// Registra o plugin CORS (@fastify/cors) para permitir requisições de origens diferentes.
app.register(import("@fastify/cors"), {
  origin: [ // Define as origens permitidas.
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Define os métodos HTTP permitidos.
  allowedHeaders: ["Content-Type", "Authorization"], // Define os cabeçalhos permitidos.
});

// Registra as rotas da aplicação.
app.register(appRoutes);

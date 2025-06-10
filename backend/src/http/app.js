import fastify from "fastify";
import { appRoutes } from "./routes/app-routes.js";

// Cria uma instância do Fastify, que é o framework web utilizado.
export const app = fastify();

// Registra o plugin CORS (Cross-Origin Resource Sharing) do Fastify.
// Isso é crucial para permitir que o frontend (rodando em uma origem diferente, ex: localhost:5173)
// faça requisições para este backend (rodando em localhost:3333).
app.register(import("@fastify/cors"), {
  // 'origin' especifica quais origens são permitidas.
  // É uma boa prática listar explicitamente os endereços do frontend.
  origin: [
    "http://localhost:5173" // Endereço comum de desenvolvimento do frontend Vite/React
  ],
  // 'methods' especifica quais métodos HTTP são permitidos nas requisições CORS.
  methods: ["GET", "POST", "PUT", "DELETE"], // OPTIONS é importante para "preflight requests"
  // 'allowedHeaders' especifica quais cabeçalhos são permitidos nas requisições.
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Registra as rotas da aplicação definidas em 'app-routes.js'.
// Todas as rotas definidas em 'appRoutes' serão adicionadas à instância do Fastify.
app.register(appRoutes);
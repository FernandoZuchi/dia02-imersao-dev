import fastify from "fastify";
import { appRoutes } from "./routes/app-routes.js";

export const app = fastify();

// Registrar CORS para permitir requisições do frontend
app.register(import('@fastify/cors'), {
    origin: true
});

app.register(appRoutes);
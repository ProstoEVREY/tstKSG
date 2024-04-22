import fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { routes } from "./routes";
import { createClient } from "redis";
import { Client } from "pg";

import dotenv from "dotenv";
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error(err);
});

export const PGClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  ssl: true,
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

const app: FastifyInstance = fastify({ logger: true });

app.register(fastifyCors);

app.register(routes);

app.get("/", (request, reply) => {
  reply.status(200).send("Hello from the Fastify");
});

app.setNotFoundHandler(async (request, reply) => {
  reply.code(404).send({ error: "Not Found" });
});

export const startServer = async () => {
  try {
    await redisClient.connect();
    await PGClient.connect();
    await app.listen({ port: PORT, host: "0.0.0.0" });
    const address = app.server.address();
    if (typeof address === "string") {
      app.log.info(`Server listening on ${address}`);
    } else {
      app.log.info(`Server listening on ${address?.port}`);
    }
  } catch (err) {
    app.log.error(err);
    await redisClient.disconnect();
    await PGClient.end();
    process.exit(1);
  }
};

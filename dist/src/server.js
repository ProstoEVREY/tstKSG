"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.PGClient = exports.redisClient = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const routes_1 = require("./routes");
const redis_1 = require("redis");
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.PGClient = new pg_1.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    ssl: true,
});
const PORT = parseInt(process.env.PORT, 10) || 3000;
const app = (0, fastify_1.default)({ logger: true });
app.register(cors_1.default);
app.register(routes_1.routes);
app.get("/", (request, reply) => {
    reply.code(200).send("Hello from the Fastify");
});
app.setNotFoundHandler(async (request, reply) => {
    reply.code(404).send({ error: "Not Found" });
});
const startServer = async () => {
    try {
        await exports.redisClient.connect();
        await exports.PGClient.connect();
        await app.listen({ port: PORT });
        const address = app.server.address();
        if (typeof address === "string") {
            app.log.info(`Server listening on ${address}`);
        }
        else {
            app.log.info(`Server listening on ${address?.port}`);
        }
    }
    catch (err) {
        app.log.error(err);
        await exports.redisClient.disconnect();
        await exports.PGClient.end();
        process.exit(1);
    }
};
exports.startServer = startServer;

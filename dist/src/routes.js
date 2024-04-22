"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const EndpointService_1 = require("./Service/EndpointService");
const server_1 = require("./server");
const DeductSchema_1 = require("./Validation/DeductSchema");
async function routes(app) {
    app.get("/v1/items", async (request, reply) => {
        try {
            const limit = request.query.limit
                ? parseInt(request.query.limit, 10)
                : null;
            const cache = await server_1.redisClient.get("items");
            if (cache) {
                const items = JSON.parse(cache);
                const limitedItems = limit ? items.slice(0, limit) : items;
                reply.send(limitedItems);
            }
            else {
                const itemTradable = await (0, EndpointService_1.fetchSkinportItems)(true);
                const itemsNotTradable = await (0, EndpointService_1.fetchSkinportItems)(false);
                const items = (0, EndpointService_1.addMinimumTradablePrices)(itemTradable, itemsNotTradable);
                await server_1.redisClient.set("items", JSON.stringify(items));
                const CACHE_EXPIRATION_SECONDS = parseInt(process.env.CACHE_EXPIRATION_SECONDS, 10) || 3600;
                // set redis expiration
                server_1.redisClient.setEx("items", CACHE_EXPIRATION_SECONDS, JSON.stringify(items));
                const limitedItems = limit ? items.slice(0, limit) : items;
                reply.code(200).send(limitedItems);
            }
        }
        catch (e) {
            reply.status(500).send({ error: "Internal Server Error" });
        }
    });
    app.put("/v1/balance/deduct/:id", { schema: DeductSchema_1.deductBalanceSchema }, async (request, reply) => {
        const userId = parseInt(request.params.id, 10);
        const { amount } = request.body;
        if (!userId || !amount) {
            reply.status(400).send({ error: "Bad request. Apply id and amount" });
        }
        try {
            const { user, updatedUser } = await (0, EndpointService_1.deductBalance)(userId, amount);
            reply.code(200).send({
                message: `Balance deducted successfully. ${user.balance} to ${updatedUser.balance}`,
            });
        }
        catch (error) {
            console.error("Error deducting balance:", error);
            reply.status(500).send({ error: "Internal Server Error:" + error });
        }
    });
}
exports.routes = routes;

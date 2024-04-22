import { FastifyInstance } from "fastify";

import {
  fetchSkinportItems,
  addMinimumTradablePrices,
  deductBalance,
} from "./Service/EndpointService";
import { redisClient } from "./server";
import { DeductRequest, ItemsRequest } from "./Types";
import { deductBalanceSchema } from "./Validation/DeductSchema";

export async function routes(app: FastifyInstance) {
  app.get("/v1/items", async (request: ItemsRequest, reply) => {
    try {
      const limit: number | null = request.query.limit
        ? parseInt(request.query.limit, 10)
        : null;

      const cache = await redisClient.get("items");

      if (cache) {
        const items = JSON.parse(cache);
        const limitedItems = limit ? items.slice(0, limit) : items;
        reply.send(limitedItems);
      } else {
        const itemTradable = await fetchSkinportItems(true);
        const itemsNotTradable = await fetchSkinportItems(false);
        const items = addMinimumTradablePrices(itemTradable, itemsNotTradable);

        await redisClient.set("items", JSON.stringify(items));

        const CACHE_EXPIRATION_SECONDS =
          parseInt(process.env.CACHE_EXPIRATION_SECONDS as string, 10) || 3600;

        // set redis expiration
        redisClient.setEx(
          "items",
          CACHE_EXPIRATION_SECONDS,
          JSON.stringify(items)
        );

        const limitedItems = limit ? items.slice(0, limit) : items;
        reply.code(200).send(limitedItems);
      }
    } catch (e) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  app.put(
    "/v1/balance/deduct/:id",
    { schema: deductBalanceSchema },
    async (request: DeductRequest, reply) => {
      const userId: number = parseInt(request.params.id as string, 10);
      const { amount } = request.body;

      if (!userId || !amount) {
        reply.status(400).send({ error: "Bad request. Apply id and amount" });
      }
      try {
        const { user, updatedUser } = await deductBalance(userId, amount);
        reply.code(200).send({
          message: `Balance deducted successfully. ${user.balance} to ${updatedUser.balance}`,
        });
      } catch (error) {
        console.error("Error deducting balance:", error);
        reply.status(500).send({ error: "Internal Server Error:" + error });
      }
    }
  );
}

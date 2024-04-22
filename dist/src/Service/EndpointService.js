"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductBalance = exports.addMinimumTradablePrices = exports.fetchSkinportItems = void 0;
const axios_1 = __importDefault(require("axios"));
const server_1 = require("../server");
async function fetchSkinportItems(tradable) {
    try {
        let apiUrl = "https://api.skinport.com/v1/items";
        apiUrl += `?tradable=${tradable}`;
        const response = await axios_1.default.get(apiUrl);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching Skinport items:", error);
        throw error;
    }
}
exports.fetchSkinportItems = fetchSkinportItems;
function addMinimumTradablePrices(itemsTradable, itemsNotTradable) {
    const result = itemsNotTradable;
    for (let i = 0; i < result.length; i++) {
        result[i].min_price_tradable = itemsTradable[i].min_price;
        result[i].min_price_not_tradable = result[i].min_price;
        delete result[i].min_price;
    }
    return result;
}
exports.addMinimumTradablePrices = addMinimumTradablePrices;
async function deductBalance(userId, amount) {
    try {
        const result = await server_1.PGClient.query("SELECT balance FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            throw new Error(`User with id ${userId} not found`);
        }
        const currentBalance = parseFloat(result.rows[0].balance);
        if (currentBalance < amount) {
            throw new Error(`Insufficient balance for user with id ${userId}`);
        }
        const newBalance = currentBalance - amount;
        await server_1.PGClient.query("UPDATE users SET balance = $1 WHERE id = $2", [
            newBalance,
            userId,
        ]);
    }
    catch (e) {
        console.error("Error deducting balance:", e);
        throw e;
    }
}
exports.deductBalance = deductBalance;

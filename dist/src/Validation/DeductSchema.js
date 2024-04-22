"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductBalanceSchema = void 0;
exports.deductBalanceSchema = {
    params: {
        type: "object",
        properties: {
            id: { type: "integer" },
        },
        required: ["id"],
    },
    body: {
        type: "object",
        properties: {
            amount: { type: "number", minimum: 0 },
        },
        required: ["amount"],
    },
};

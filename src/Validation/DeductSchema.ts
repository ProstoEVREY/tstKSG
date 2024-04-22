export const deductBalanceSchema = {
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

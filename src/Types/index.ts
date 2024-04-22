import { FastifyRequest } from "fastify";

export interface SkinportItem {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price?: number;
  min_price_tradable?: number;
  min_price_not_tradable?: number;
  max_price?: number;
  mean_price?: number;
  quantity: number;
  created_at: number;
  updated_at: number;
}

export type ItemsRequest = FastifyRequest<{
  Querystring: {
    limit?: string;
  };
}>;

export type DeductRequest = FastifyRequest<{
  Params: {
    id?: string;
  };
  Body: {
    amount: number;
  };
}>;

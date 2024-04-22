import axios from "axios";
import { SkinportItem } from "../Types";
import { PGClient } from "../server";

export async function fetchSkinportItems(
  tradable: boolean
): Promise<SkinportItem[]> {
  try {
    let apiUrl = "https://api.skinport.com/v1/items";
    apiUrl += `?tradable=${tradable}`;

    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching Skinport items:", error);
    throw error;
  }
}

export function addMinimumTradablePrices(
  itemsTradable: SkinportItem[],
  itemsNotTradable: SkinportItem[]
): SkinportItem[] {
  const result = itemsNotTradable;
  for (let i = 0; i < result.length; i++) {
    result[i].min_price_tradable = itemsTradable[i].min_price;
    result[i].min_price_not_tradable = result[i].min_price;
    delete result[i].min_price;
  }

  return result;
}

export async function deductBalance(userId: number, amount: number) {
  try {
    const result = await PGClient.query(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error(`User with id ${userId} not found`);
    }

    const currentBalance = parseFloat(result.rows[0].balance);

    if (currentBalance < amount) {
      throw new Error(`Insufficient balance for user with id ${userId}`);
    }
    const newBalance = currentBalance - amount;

    const users = await PGClient.query(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    );

    const user = users.rows[0] ? users.rows[0] : null;

    if (!user) {
      throw new Error(`No such user with this ID exists`);
    }

    await PGClient.query("UPDATE users SET balance = $1 WHERE id = $2", [
      newBalance,
      userId,
    ]);

    const updatedUsers = await PGClient.query(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    );

    const updatedUser = updatedUsers.rows[0] ? updatedUsers.rows[0] : null;

    return { user, updatedUser };
  } catch (e) {
    console.error("Error deducting balance:", e);
    throw e;
  }
}

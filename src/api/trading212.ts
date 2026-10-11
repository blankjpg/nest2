import type { DemoOrder, Trading212DemoAccount } from '../types';
import { roundCurrency } from '../lib/math';

const MOCK_CASH_BALANCE = 10_000;
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let connected = false;
let cashBalance = MOCK_CASH_BALANCE;
let orders: DemoOrder[] = [];

export async function connectTrading212(apiKey: string): Promise<Trading212DemoAccount> {
  if (!apiKey.trim()) {
    throw new Error('Enter a non-empty demo API key to connect.');
  }

  await delay(1500);
  connected = true;
  return {
    connected: true,
    cashBalance,
  };
}

export async function disconnectTrading212(): Promise<void> {
  await delay();
  connected = false;
}

export async function getDemoAccount(): Promise<Trading212DemoAccount | null> {
  await delay();
  return connected
    ? {
        connected: true,
        cashBalance,
      }
    : null;
}

export async function placeDemoOrder(
  ticker: string,
  amountGbp: number
): Promise<DemoOrder> {
  if (!connected) {
    throw new Error('Connect the Trading 212 demo account before placing an order.');
  }
  if (!ticker.trim()) {
    throw new Error('A stock ticker is required to place a demo order.');
  }
  if (!Number.isFinite(amountGbp) || amountGbp <= 0) {
    throw new Error('The demo order amount must be greater than £0.');
  }
  if (roundCurrency(amountGbp) > cashBalance) {
    throw new Error('The demo order amount exceeds the available demo cash balance.');
  }

  await delay();
  const order: DemoOrder = {
    id: `demo_order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ticker: ticker.trim().toUpperCase(),
    amountGbp: roundCurrency(amountGbp),
    date: new Date().toISOString(),
    status: 'Filled (demo)',
  };
  cashBalance = roundCurrency(cashBalance - order.amountGbp);
  orders = [order, ...orders];
  return { ...order };
}

export async function getDemoOrders(): Promise<DemoOrder[]> {
  await delay();
  return orders.map((order) => ({ ...order }));
}

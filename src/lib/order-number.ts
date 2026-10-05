// The order number customers and the admin see: the last 8 characters of the Stripe
// Checkout Session id, uppercased (same as `number` in src/lib/admin/orders.ts).
export function orderNumber(sessionId: string): string {
    return sessionId.slice(-8).toUpperCase();
}

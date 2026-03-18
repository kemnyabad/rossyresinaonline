export async function trackProductCartAdd(productId: number | string, quantity = 1) {
  try {
    await fetch(`/api/products/${encodeURIComponent(String(productId))}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "cart_add",
        quantity: Math.max(1, Number(quantity || 1)),
      }),
    });
  } catch {
    // Silent on purpose: metrics must not block cart UX.
  }
}

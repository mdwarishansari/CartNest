/**
 * Pure cart calculation helpers used by API responses and tests.
 */

const getItemPrice = (item) =>
  item?.productId?.price ?? item?.priceAtAdd ?? item?.price ?? 0;

const calculateLineTotal = (price, qty) => {
  if (typeof price !== "number" || typeof qty !== "number") return 0;
  if (price < 0 || qty < 1) return 0;
  return price * qty;
};

const getCartCount = (items = []) =>
  items.reduce((sum, item) => sum + (item.qty || 0), 0);

const getCartSubtotal = (items = []) =>
  items.reduce(
    (sum, item) => sum + calculateLineTotal(getItemPrice(item), item.qty || 0),
    0,
  );

const mergeCartItem = (items, productId, qty, product) => {
  const nextItems = items.map((item) => ({ ...item }));
  const existing = nextItems.find(
    (item) => item.productId?.toString?.() === productId || item.productId === productId,
  );

  if (existing) {
    existing.qty += qty;
  } else {
    nextItems.push({
      productId,
      qty,
      priceAtAdd: product.price,
      sellerId: product.sellerId,
    });
  }

  return nextItems;
};

module.exports = {
  getItemPrice,
  calculateLineTotal,
  getCartCount,
  getCartSubtotal,
  mergeCartItem,
};

const DEFAULT_COMMISSION_RATE = 0.1;

const calculateOrderTotal = (items = []) =>
  items.reduce((sum, item) => {
    const price = item.price ?? item.productId?.price ?? 0;
    const qty = item.qty ?? 0;
    return sum + price * qty;
  }, 0);

const calculateCommission = (amount, rate = DEFAULT_COMMISSION_RATE) =>
  Math.round(amount * rate * 100) / 100;

const calculateNetEarnings = (amount, rate = DEFAULT_COMMISSION_RATE) =>
  amount - calculateCommission(amount, rate);

const aggregateSellerAmounts = (items = []) => {
  const sellerAmounts = {};

  for (const item of items) {
    const sellerId = item.sellerId?.toString?.() ?? String(item.sellerId);
    const lineTotal = (item.price ?? 0) * (item.qty ?? 0);
    sellerAmounts[sellerId] = (sellerAmounts[sellerId] || 0) + lineTotal;
  }

  return sellerAmounts;
};

module.exports = {
  DEFAULT_COMMISSION_RATE,
  calculateOrderTotal,
  calculateCommission,
  calculateNetEarnings,
  aggregateSellerAmounts,
};

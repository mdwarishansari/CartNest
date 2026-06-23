const calculateDiscountPercent = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

const calculateSavings = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return mrp - price;
};

const hasDiscount = (mrp, price) => Boolean(mrp && price && mrp > price);

module.exports = {
  calculateDiscountPercent,
  calculateSavings,
  hasDiscount,
};

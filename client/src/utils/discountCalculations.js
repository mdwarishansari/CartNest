export const calculateDiscountPercent = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const calculateSavings = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return mrp - price;
};

export const hasDiscount = (mrp, price) => Boolean(mrp && price && mrp > price);

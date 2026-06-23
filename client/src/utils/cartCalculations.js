export const getItemPrice = (item) =>
  item?.productId?.price ?? item?.priceAtAdd ?? item?.price ?? 0;

export const calculateLineTotal = (price, qty) => {
  if (typeof price !== 'number' || typeof qty !== 'number') return 0;
  if (price < 0 || qty < 1) return 0;
  return price * qty;
};

export const getCartCount = (items = []) =>
  items.reduce((sum, item) => sum + (item.qty || 0), 0);

export const getCartSubtotal = (items = []) =>
  items.reduce(
    (sum, item) => sum + calculateLineTotal(getItemPrice(item), item.qty || 0),
    0,
  );

const CANCELLABLE_STATUSES = ["pending", "placed"];

const ORDER_STATUS_TRANSITIONS = {
  pending: ["placed", "cancelled"],
  placed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const canCancelOrder = (status) => CANCELLABLE_STATUSES.includes(status);

const canTransitionOrderStatus = (fromStatus, toStatus) =>
  (ORDER_STATUS_TRANSITIONS[fromStatus] || []).includes(toStatus);

const isValidPaymentStatus = (status) =>
  ["pending", "paid", "failed", "refunded"].includes(status);

module.exports = {
  CANCELLABLE_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  canCancelOrder,
  canTransitionOrderStatus,
  isValidPaymentStatus,
};

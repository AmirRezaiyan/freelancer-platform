export const buildProposalPayload = (projectId, bidAmount, message) => ({
  project: projectId,
  message,
  bid_amount: Number(bidAmount),
});

export function validateProposalBid(value, budgetMin, budgetMax) {
  const bidAmount = Number(value);
  if (!Number.isInteger(bidAmount) || bidAmount < 1) {
    return "مبلغ پیشنهاد باید عدد صحیح و مثبت باشد.";
  }
  if (budgetMin != null && bidAmount < Number(budgetMin)) {
    return "مبلغ پیشنهاد کمتر از حداقل بودجه پروژه است.";
  }
  if (budgetMax != null && bidAmount > Number(budgetMax)) {
    return "مبلغ پیشنهاد بیشتر از حداکثر بودجه پروژه است.";
  }
  return null;
}
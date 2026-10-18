export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

export const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const daysLeft = (deadline) => {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const progressPercent = (raised, goal) => {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
};

export const statusColor = (status) => {
  switch (status) {
    case "approved":
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "rejected":
    case "failed":
      return "bg-red-100 text-red-700";
    case "suspended":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

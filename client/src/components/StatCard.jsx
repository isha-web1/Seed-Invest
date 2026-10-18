export default function StatCard({ label, value, icon: Icon, accent = "teal", suffix = "" }) {
  const accents = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="card flex items-center gap-4 p-5 animate-fade-up">
      {Icon && (
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accents[accent]}`}>
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value}
          {suffix}
        </p>
      </div>
    </div>
  );
}

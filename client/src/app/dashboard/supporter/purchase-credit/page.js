"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Coins, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { formatCurrency } from "@/lib/utils";

function PurchaseInner() {
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api
      .get("/payments/packages")
      .then(({ data }) => setPackages(data.packages))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      api
        .post("/payments/confirm", { sessionId })
        .then(() => {
          toast.success("Payment successful! Credits added.");
          refreshUser();
        })
        .catch((err) => toast.error(err.message));
    } else if (searchParams.get("canceled")) {
      toast.error("Payment canceled.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const buy = async (packageId) => {
    setBusy(packageId);
    try {
      const { data } = await api.post("/payments/checkout", { packageId });
      if (data.url) {
        window.location.assign(data.url);
      } else {
        toast.success("Credits purchased!");
        refreshUser();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy("");
    }
  };

  if (loading) return <Loader label="Loading packages..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Purchase Credit</h1>
      <p className="text-sm text-slate-500">
        Buy credits to back campaigns. 10 credits = $1.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card flex flex-col items-center p-6 text-center transition hover:-translate-y-1 hover:shadow-md">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <Coins className="h-7 w-7" />
            </span>
            <p className="mt-3 text-2xl font-extrabold">{pkg.credits}</p>
            <p className="text-sm text-slate-500">credits</p>
            <p className="mt-2 text-lg font-bold text-teal-700">{formatCurrency(pkg.price)}</p>
            <button
              className="btn-primary mt-4 w-full"
              onClick={() => buy(pkg.id)}
              disabled={busy === pkg.id}
            >
              {busy === pkg.id ? "Processing..." : "Buy now"}
            </button>
          </div>
        ))}
      </div>

      <div className="card flex items-start gap-3 p-4 text-sm text-slate-600">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-600" />
        <p>
          Payments are processed securely through Stripe. If Stripe isn’t configured in this
          environment, purchases are applied as instant dummy payments for testing.
        </p>
      </div>
    </div>
  );
}

export default function PurchaseCreditPage() {
  return (
    <Suspense fallback={<Loader label="Loading..." />}>
      <PurchaseInner />
    </Suspense>
  );
}
